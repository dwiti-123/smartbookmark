import { supabase } from "@/lib/supabase";
import { Bookmark } from "@/types/type";
import Anthropic from "@anthropic-ai/sdk";

// Fetch page title from URL using HTML
export const fetchPageTitle = async (url: string): Promise<string | null> => {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return null;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Try to extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      return title;
    }

    // Try to extract from og:title meta tag
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
    );
    if (ogTitleMatch && ogTitleMatch[1]) {
      const title = ogTitleMatch[1].trim();
      return title;
    }

    return null;
  } catch (err) {
    return null;
  }
};

// Generate title using AI (fallback when HTML fails)
export const generateTitleWithAI = async (
  url: string
): Promise<string | null> => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return null;
    }

    // First, fetch the page content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract relevant content (limit to first 5KB to save tokens)
    const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = (contentMatch ? contentMatch[1] : html).substring(0, 5000);

    // Remove HTML tags and clean up
    const textContent = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!textContent) {
      return null;
    }

    // Call Claude API with the actual page content
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: `Based on this webpage content, suggest a SHORT, CLEAR, and DESCRIPTIVE title (2-6 words max). Only respond with the title, nothing else.\n\nContent:\n${textContent}`,
        },
      ],
    });

    const aiTitle =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : null;
    return aiTitle || null;
  } catch (err) {
    return null;
  }
};

// Fetch all bookmarks for user
export const fetchBookmarks = async (): Promise<Bookmark[]> => {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
};

// Check if bookmark URL already exists
export const checkDuplicate = async (
  userId: string,
  url: string
): Promise<{ isDuplicate: boolean; existingBookmark?: Bookmark }> => {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("url", url)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      return { isDuplicate: true, existingBookmark: data };
    }

    return { isDuplicate: false };
  } catch (err) {
    throw err;
  }
};

// Add new bookmark
export const addBookmark = async (
  userId: string,
  title: string,
  url: string
): Promise<void> => {
  try {
    const { error } = await supabase.from("bookmarks").insert([
      {
        user_id: userId,
        title,
        url,
      },
    ]);

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

// Update bookmark
export const updateBookmark = async (
  bookmarkId: string,
  userId: string,
  title: string,
  url: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("bookmarks")
      .update({ title, url })
      .eq("id", bookmarkId)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

// Delete bookmark
export const deleteBookmark = async (
  bookmarkId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

// Subscribe to real-time changes on bookmarks table
export const subscribeToBookmarks = (callback: () => void) => {
  const subscription = supabase
    .channel("realtime-bookmarks", {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
      },
      (payload) => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};