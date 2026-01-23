# 🎓 Public Free Courses - Lead Generation Feature

> **Goal**: Create a public-facing course experience that converts visitors into platform users

---

## 📋 Overview

| Aspect | Details |
|--------|---------|
| **Route** | `/free-courses` |
| **Target** | Unauthenticated visitors |
| **Conversion Goal** | Drive signups to full platform |

---

## 🎯 Featured Courses

| # | Course | Why It Works |
|---|--------|--------------|
| 1 | **What It Means to Be 'In Business'** | Entry point, answers fundamental questions |
| 2 | **How to Open a Business** | Actionable, high-intent topic |
| 3 | **SoloLaunch Blueprint** | Comprehensive flagship content |

---

## 🏗️ Implementation Tasks

### Phase 1: Foundation
- [ ] Add `is_public_preview` column to courses table
- [ ] Create RLS policy for anonymous course access
- [ ] Create `usePublicCourses.ts` hook

### Phase 2: Components  
- [ ] Build `FreeCourses.tsx` landing page
- [ ] Build `PublicCourseViewer.tsx` component
- [ ] Add strategic CTAs between lessons

### Phase 3: Integration
- [ ] Add route to `App.tsx`
- [ ] Update `PublicNav.tsx` with link
- [ ] Update `PublicFooter.tsx` with link
- [ ] Create OG image for social sharing

---

## 🔄 User Journey

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Landing Page   │────▶│  Course Viewer  │────▶│   Sign Up CTA   │
│                 │     │                 │     │                 │
│ • Course cards  │     │ • Full lessons  │     │ • Email capture │
│ • Platform USPs │     │ • Quizzes work  │     │ • Unlock all 85+│
│ • Trust signals │     │ • CTAs between  │     │ • VOPSy teaser  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 💡 Strategic CTAs

| Trigger | Message | Destination |
|---------|---------|-------------|
| Before Lesson 1 | "Create free account to track progress" | `/hub` |
| After Lesson 2 | "This is 1 of 85+ courses. Unlock them all." | `/hub` |
| Quiz Complete | "Get your certificate - Sign up free" | `/hub` |
| Course Complete | "You're ready! Join Virtual OPS Hub" | `/hub` |
| Sidebar | "VOPSy AI can answer questions 24/7" | `/vopsy` |

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `src/pages/FreeCourses.tsx` | Public landing page |
| `src/components/academy/PublicCourseViewer.tsx` | Auth-free viewer |
| `src/hooks/usePublicCourses.ts` | Anonymous data fetch |

## 📝 Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/free-courses` route |
| `src/components/layout/PublicNav.tsx` | Add nav link |
| `src/components/layout/PublicFooter.tsx` | Add footer link |

---

## ✅ Success Metrics

- [ ] Visitors can complete full courses without login
- [ ] Strategic CTAs appear at natural stopping points
- [ ] Mobile-responsive design matches platform aesthetic
- [ ] SEO metadata optimized for organic discovery

---

## 🚀 Ready to Build?

**Recommended start**: Database migration to add `is_public_preview` flag, then build the landing page.
