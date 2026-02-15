# Smart Bookmark App

A bookmark management application built with Next.js and Supabase. Users can authenticate using Google, manage bookmarks, prevent duplicate entries, and generate AI-powered titles.

## Features

- Google authentication using Supabase Auth
- Add, edit, and delete bookmarks
- Duplicate bookmark prevention
- AI-generated bookmark titles

## Tech Stack

- Next.js
- Supabase (Authentication & Database)
- Anthropic API

## Setup & Run

Install dependencies:
npm install

Create a `.env.local` file and add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
NEXT_PUBLIC_APP_URL=http://localhost:3000  
NEXT_ANTHROPIC_API_KEY=your_anthropic_api_key  

Authentication is handled via Supabase Auth with only the Google provider enabled.

Run the project:
npm run dev

## Problem Faced
When I first implemented Google login, clicking the sign-in button did not open the Google login page. It only worked after clicking again or refreshing the page.

## How It Was Solved

I checked my code and reviewed the Supabase documentation and realized I had mixed two different Supabase authentication approaches. I fixed this by refactoring the code to use a single, correct authentication flow. After this change, Google login worked correctly on the first click.

## AI Usage

AI was used to assist in generating UI components and layout ideas.

![Untitled](https://github.com/user-attachments/assets/b25a7f99-a265-4b84-a365-d2428933e5d0)
