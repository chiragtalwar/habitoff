I'll create a detailed Product Requirements Document (PRD) for our Habito - Mindful Habits Garden Chrome Extension.

# Habito - Mindful Habits Garden PRD

## Overview
Habito is a Chrome extension that helps users build and maintain mindful habits by gamifying the habit-tracking experience through a garden metaphor. Each habit is represented as a plant that grows as users maintain their streaks.

## Core Features

### 1. Authentication & User Management
- Google OAuth2 sign-in integration
- Secure token management using Chrome's storage API
- User profile management with customizable settings
- Seamless sync across devices using Supabase backend

### 2. Habit Garden Dashboard
- **Visual Garden Interface**
  - Each habit represented as a unique plant
  - Plants grow through different stages based on streak length
  - Visual weather effects based on habit completion rates
  - Day/night cycle based on user's local time

- **Habit Management**
  - Create new habits with customizable:
    - Name and description
    - Frequency (daily, weekly, specific days)
    - Reminder times
    - Plant type selection
  - Edit existing habits
  - Archive completed or unwanted habits
  - Categorize habits (Health, Learning, Fitness, etc.)

### 3. Progress Tracking
- **Streak System**
  - Daily streak counting
  - Streak freeze feature (limited uses)
  - Recovery mechanics for broken streaks
  - Weekly and monthly streak analytics

- **Achievement System**
  - Milestone badges for consistent habit maintenance
  - Special plant variations unlocked through achievements
  - Seasonal challenges and rewards
  - Social sharing of achievements

### 4. Analytics & Insights
- **Personal Statistics**
  - Habit completion rates
  - Streak history
  - Best performing habits
  - Time-based analytics (daily, weekly, monthly views)

- **Progress Reports**
  - Weekly email summaries
  - Monthly progress insights
  - Habit correlation analysis
  - Personalized improvement suggestions

### 5. Notification System
- Chrome browser notifications
- Customizable reminder times
- Smart notification scheduling
- Positive reinforcement messages

## Technical Architecture

### Frontend
- React with TypeScript
- TailwindCSS for styling
- Chrome Extension APIs
- Service Worker for background tasks

### Backend (Supabase)
- User authentication
- Real-time data sync
- Habit data storage
- Analytics processing

### Database Schema
```sql
users
- id
- email
- created_at
- settings

habits
- id
- user_id
- name
- description
- frequency
- plant_type
- created_at
- archived_at

habit_logs
- id
- habit_id
- completed_at
- streak_count

achievements
- id
- user_id
- type
- unlocked_at

settings
- id
- user_id
- notification_preferences
- theme_preferences
```

## User Experience

### New User Flow
1. Install extension
2. Sign in with Google
3. Tutorial walkthrough
4. Create first habit
5. Set notification preferences

### Daily User Flow
1. Click extension icon
2. View garden dashboard
3. Check off completed habits
4. View progress animations
5. Receive positive reinforcement

## Performance Requirements
- Load time < 2 seconds
- Smooth animations (60fps)
- Offline functionality
- Real-time sync when online
- Minimal memory footprint

## Security Requirements
- Secure OAuth2 implementation
- Encrypted data storage
- Safe token management
- Privacy-focused data handling

## Future Enhancements (v2)
1. Social features
   - Friend gardens
   - Habit challenges
   - Community achievements

2. Advanced Analytics
   - AI-powered insights
   - Habit pattern recognition
   - Custom reporting

3. Integration Features
   - Calendar sync
   - Task manager integration
   - Health app connectivity
