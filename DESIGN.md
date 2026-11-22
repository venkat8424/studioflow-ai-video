# StudioFlow — Frontend Design Specification

**Version:** 1.0  
**Status:** MVP  
**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Theme:** Dark / Cinematic  
**Design Reference Directory:** `.ai-mocks/`

---

## 1. Product Overview

StudioFlow is an AI-powered video generation and review platform designed for creative studios, filmmakers, and production teams.

The platform enables users to:

1. Submit AI video generation requests using creative prompts and reference images.
2. Monitor video generation progress.
3. Browse previously generated videos.
4. Preview completed videos.
5. Approve or reject generated videos with feedback.

### Design Objective

Create a professional, cinematic interface that feels like a creative production workspace rather than a conventional enterprise dashboard or generic AI chatbot.

The experience should emphasize:

- **Creative simplicity:** Minimize friction between an idea and video generation.
- **Visual storytelling:** Prioritize video previews and creative assets.
- **Production organization:** Clearly identify projects, shots, and generations.
- **Workflow visibility:** Make generation and review states immediately understandable.
- **Professional aesthetics:** Maintain the visual quality expected from tools used by filmmakers and creative professionals.

### MVP Philosophy

The MVP must be clean, functional, and visually polished without unnecessary complexity.

Prioritize the essential workflow:

**Create → Generate → Monitor → Preview → Review**

Avoid adding features or UI elements that are not explicitly included in this specification.

---

## 2. Design References

All approved UI reference images are stored in:

`.ai-mocks/`

### Approved Screens

| Screen | Reference | Status |
|---|---|---|
| Generation Form | `.ai-mocks/generation-form.png` | Approved |
| Generation Library | TBD | Conceptual |
| Generation Review | TBD | Conceptual |

### Reference Image Guidelines

- Follow the approved images for layout, visual hierarchy, colors, component styling, and overall aesthetics.
- Use this document for exact design tokens, functionality, validation, and responsive behavior.
- Written specifications take precedence when a mockup is ambiguous or incomplete.
- Do not modify, replace, or regenerate reference images without explicit authorization.
- Do not introduce additional components simply because they appear in unrelated design references.

The Generation Form reference is the primary visual source for the initial implementation.

---

## 3. Visual Design Philosophy

### Overall Style

StudioFlow uses a modern, dark cinematic aesthetic inspired by professional video production and creative editing environments.

The interface should feel:

- Minimal and uncluttered.
- Premium and production-oriented.
- Dark but visually accessible.
- Creative without excessive decoration.
- Professional and responsive.

### Visual Principles

**1. Content-first design**

Generation details and video content are more important than decorative UI elements.

**2. Restrained accent usage**

Purple is the primary accent color. Use it for selected navigation states, primary actions, focus indicators, and important interactive elements.

**3. Subtle visual depth**

Differentiate the application background, cards, and input fields through surface colors and subtle borders.

Avoid heavy shadows and excessive gradients.

**4. Consistent geometry**

Use rounded corners throughout the interface.

**5. Clear hierarchy**

Each screen should have one obvious primary purpose and one primary action.

---

## 4. Color System

### 4.1 Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#101116` | Main application background |
| `surface` | `#1D1E27` | Cards, panels, content containers |
| `surface-elevated` | `#252631` | Elevated panels, dropdown menus |
| `input-background` | `#30313D` | Form inputs, textareas, selection controls |
| `primary` | `#7155E8` | Primary buttons, selected navigation, focus |
| `primary-hover` | `#8067F0` | Primary button hover state |
| `primary-active` | `#5F45CF` | Primary button pressed state |
| `text-primary` | `#FFFFFF` | Main headings and important text |
| `text-secondary` | `#B8B8C8` | Labels and supporting text |
| `text-muted` | `#9CA3AF` | Placeholders and metadata |
| `border` | `#454653` | Input borders and separators |
| `border-subtle` | `#353642` | Card borders and subtle dividers |

### 4.2 Status Colors

| State | Color | Usage |
|---|---|---|
| Success | `#4ADE80` | Completed generation |
| Warning | `#FBBF24` | Pending or processing |
| Error | `#F87171` | Failed generation, rejected review |
| Info | `#60A5FA` | Informational messages |
| Approved | `#4ADE80` | Approved videos |
| Rejected | `#F87171` | Rejected videos |
| Neutral | `#9CA3AF` | Unreviewed videos |

Status colors should be accompanied by readable text labels. Do not communicate status through color alone.

### 4.3 CSS Variables

Define the following variables globally:

```css
:root {
  --color-background: #101116;
  --color-surface: #1d1e27;
  --color-surface-elevated: #252631;
  --color-input: #30313d;

  --color-primary: #7155e8;
  --color-primary-hover: #8067f0;
  --color-primary-active: #5f45cf;

  --color-text-primary: #ffffff;
  --color-text-secondary: #b8b8c8;
  --color-text-muted: #9ca3af;

  --color-border: #454653;
  --color-border-subtle: #353642;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```

Avoid scattering hardcoded color values throughout React components.

---

## 5. Typography

### Font Family

**Primary font:** Inter

**Fallback:** `system-ui, sans-serif`

Use the same font family throughout the application.

### Type Scale

| Element | Font Size | Weight |
|---|---|---|
| Application title | 24px | 700 |
| Page title | 28px | 600 |
| Section heading | 20px | 600 |
| Card heading | 18px | 600 |
| Body text | 14px | 400 |
| Form label | 13px | 500 |
| Button text | 14px | 600 |
| Supporting text | 12px | 400 |
| Small metadata | 11px | 400 |

### Typography Rules

- Use white for primary headings.
- Use secondary text colors for labels and supporting descriptions.
- Use muted text for placeholders and metadata.
- Use a line height of approximately 1.5 for body text.
- Avoid excessive uppercase text.
- Uppercase may be used sparingly for small brand subtitles.
- Avoid decorative fonts.

---

## 6. Layout and Spacing

### Application Layout

The application uses a centered content layout.

**Maximum content width:** 1200px

**Preferred Generation Form width:** 800px

The Generation Form should not stretch excessively on wide desktop screens.

### Spacing Scale

Use an 8px-based spacing system.

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 24px |
| `space-6` | 32px |
| `space-7` | 48px |
| `space-8` | 64px |

### Layout Guidelines

- Main application padding: 24–32px on desktop.
- Card padding: 24px.
- Space between major sections: 24px.
- Space between related fields: 16px.
- Space between label and input: 8px.
- Minimum interactive target size: 44px where practical.

### Border Radius

| Component | Radius |
|---|---|
| Buttons | 8px |
| Inputs | 8px |
| Dropdowns | 8px |
| Small cards | 12px |
| Main panels | 16px |
| Large containers | 20px |

### Shadows

Use shadows sparingly.

Preferred card shadow:

```css
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
```

Avoid strong glows, heavy drop shadows, and prominent gradients.

---

## 7. Application Shell

### Header

The application header contains:

**Left:**

- Purple clapperboard logo.
- StudioFlow product name.
- Small subtitle: `AI PRODUCTION STUDIO`

**Right:**

- Small `MVP` badge.

### Header Styling

- Background matches the application background.
- Logo uses the primary purple accent.
- Product name is white and bold.
- Subtitle is uppercase with muted coloring.
- No heavy borders or unnecessary decoration.

### Navigation

Three navigation tabs:

1. Create
2. Library
3. Review

Use a segmented navigation control consistent with the approved mockup.

**Active tab:**

- Purple or visibly elevated selected background.
- White text.
- Rounded corners.

**Inactive tabs:**

- Muted text.
- Subtle hover background.

### Navigation Behavior

- `Create` displays the Generation Form.
- `Library` displays generation history.
- `Review` displays completed videos requiring review.
- Selected navigation state must be visually obvious.
- Navigation should work without full-page reloads.

For the MVP, React Router is optional. A simple navigation implementation is acceptable if it supports the required workflow.

---

# 8. Screen 1 — Generation Form

**Implementation Priority:** Highest

**Visual Reference:** `.ai-mocks/generation-form.png`

## 8.1 Purpose

Enable users to submit an AI video generation request quickly and intuitively.

The screen should prioritize creative input rather than technical configuration.

## 8.2 Page Structure

The Generation Form is displayed inside a centered dark card.

### Card Header

**Title:** Create a new shot

No additional marketing text, promotional banners, or decorative panels.

### Field Order

1. Project Name and Shot Name
2. Creative Prompt
3. Reference Image URL
4. Ratio and Duration
5. Generation Summary and Generate Button

Preserve this ordering.

---

## 8.3 Project Name

**Label:** Project

**Field Type:** Single-line text input

**Required:** Yes

**Example:** Project Aurora

**Maximum Length:** 100 characters

### Styling

- Dark input background.
- Rounded corners.
- Subtle border.
- White input text.
- Muted placeholder text.

---

## 8.4 Shot Name

**Label:** Shot name

**Field Type:** Single-line text input

**Required:** Yes

**Example:** Opening aerial

**Maximum Length:** 100 characters

### Layout

On desktop, display Project and Shot Name side by side.

Each field occupies approximately 50% of the available row width.

On mobile, stack the fields vertically.

---

## 8.5 Creative Prompt

**Label:** Creative prompt

**Field Type:** Multiline textarea

**Required:** Yes

**Maximum Length:** 2000 characters

**Example:**

A cinematic aerial camera moves slowly over a futuristic city at sunrise, with golden light reflecting off skyscrapers.

### Styling

- Full card width.
- Minimum height approximately 120px.
- Rounded corners.
- Input surface background.
- White text.
- Comfortable internal padding.

### Behavior

- Allow multiline input.
- Display validation feedback for empty input.
- Do not automatically rewrite or modify the user's prompt.
- Do not add AI prompt enhancement features in the MVP.

---

## 8.6 Reference Image

**Label:** Reference image URL

**Field Type:** URL input

**Required:** Yes

The user provides an accessible HTTPS image URL for image-to-video generation.

### Visual Design

Use the upload-style reference area shown in the approved mockup.

The area should include:

- Image icon.
- Reference image label.
- Short helper text.
- URL input.

### Helper Text

Provide a publicly accessible image URL.

### Behavior

- Accept HTTPS URLs.
- Validate the URL before submission.
- Show a clear message when the field is invalid.
- Do not upload image files to the backend in the MVP.
- Do not implement image storage or media management.

The upload-style appearance is visual only. Do not imply that drag-and-drop or local file uploads are supported.

### Optional Enhancement

A small image preview can be displayed when a valid URL has been entered.

This is optional and must not delay the initial implementation.

---

## 8.7 Ratio Dropdown

**Label:** Aspect ratio

**Field Type:** Dropdown

**Required:** Yes

**Default:** 16:9 Landscape

### Initial Options

| Label | API Value |
|---|---|
| 16:9 Landscape | `1280:720` |
| 9:16 Portrait | `720:1280` |

The values submitted to FastAPI must match the backend's expected format.

### Styling

- Same height as the Duration dropdown.
- Dark input background.
- Rounded corners.
- Dropdown chevron aligned to the right.

### Behavior

- Display the human-readable label.
- Submit the corresponding API value.
- Do not introduce custom aspect ratios in the MVP.
- Available options must be compatible with the configured generation model.

---

## 8.8 Duration Dropdown

**Label:** Duration

**Field Type:** Dropdown

**Required:** Yes

**Default:** 5 seconds

### Initial Options

| Label | API Value |
|---|---|
| 5 seconds | `5` |
| 10 seconds | `10` |

### Behavior

- Display duration in seconds.
- Submit the numerical duration value.
- Reject unsupported values.
- Keep the available options synchronized with the backend's supported model configuration.

### Layout

Display Ratio and Duration side by side on desktop.

On mobile, stack the dropdowns vertically.

---

## 8.9 Generation Summary

At the bottom of the form, display a compact generation summary.

Example:

`16:9 · 5 sec · Runway`

### Behavior

- Update ratio when the dropdown changes.
- Update duration when the dropdown changes.
- Provider name remains `Runway` for the MVP.

### Styling

- Small muted text.
- Left-aligned on desktop.
- Positioned near the Generate button.

---

## 8.10 Generate Button

**Label:** Generate

**Icon:** Sparkles

**Style:** Primary purple button

### Default State

- Purple background.
- White text.
- Rounded corners.
- Positioned at the bottom-right of the form.

### Hover State

- Slightly lighter purple.

### Loading State

- Display loading spinner.
- Change label to `Submitting...`.
- Disable repeated submissions.

### Disabled State

Disable the button if required inputs are missing or invalid.

### Submission Behavior

When clicked:

1. Validate all fields.
2. Construct the generation request.
3. Submit the request to `POST /api/generate`.
4. Display an appropriate loading state.
5. Handle API errors.
6. On successful submission, show confirmation and navigate to or display the newly created generation's status.

Do not wait for video generation to complete before acknowledging a successful submission.

---

# 9. Screen 2 — Generation Library

**Implementation Priority:** Medium

## 9.1 Purpose

Provide a visual overview of previously submitted generation jobs.

## 9.2 Layout

Use a grid of video-generation cards.

### Desktop

Three columns when sufficient space is available.

### Tablet

Two columns.

### Mobile

One column.

## 9.3 Generation Card

Each card includes:

- Video thumbnail or placeholder.
- Shot name.
- Project name.
- Generation status.
- Review status.
- Creation timestamp.

### Thumbnail

For completed generations, display the generated video preview or a suitable static preview when available.

For pending or processing generations, display a dark placeholder with a status icon.

Do not assume that the Runway output URL provides a thumbnail image.

For the MVP, a video preview element or a generic video placeholder is sufficient.

### Card Interaction

Clicking a card opens the corresponding generation details.

### Card States

**Pending**

- Neutral placeholder.
- Pending status label.

**Processing**

- Loading indicator.
- Processing status label.

**Completed**

- Available video preview.
- Completed label.

**Failed**

- Error status indicator.
- Short failure message.

## 9.4 Empty State

When no generations exist:

**Title:** No generations yet

**Description:** Create your first AI-generated video shot to get started.

**Action:** Create a shot

## 9.5 API Integration

Endpoint:

`GET /api/generations`

Display results in descending creation order, newest first.

Support loading, empty, and error states.

Pagination can be implemented using the backend's `limit` and `offset` parameters.

---

# 10. Screen 3 — Generation Review

**Implementation Priority:** Medium

## 10.1 Purpose

Allow users to inspect generated videos and provide approval decisions.

## 10.2 Layout

The screen includes:

1. Video preview.
2. Shot metadata.
3. Creative prompt.
4. Review controls.

### Video Preview

Display the generated video in a prominent player.

The player should:

- Preserve the video's aspect ratio.
- Include playback controls.
- Allow pause and replay.
- Avoid autoplay with sound.

Do not stretch or crop the video in a way that distorts its content.

### Shot Metadata

Display:

- Project name.
- Shot name.
- Generation ID.
- Aspect ratio.
- Duration.
- Generation status.
- Review status.
- Creation timestamp.

### Creative Prompt

Display the original creative prompt in a readable dark panel.

The user should be able to refer to the original creative direction while reviewing the video.

---

## 10.3 Review Actions

Provide two primary review actions:

**Reject**

- Outlined button with a subtle red accent.
- Clearly labeled `Reject`.

**Approve**

- Prominent purple button.
- Clearly labeled `Approve`.

The approval button should remain consistent with the application's primary accent color.

### Review Feedback

Allow the user to optionally enter review comments.

**Example:**

Camera movement is too fast. Regenerate with slower motion.

### Review Behavior

- Review controls are enabled only when generation status is `completed`.
- Submitting review feedback calls the backend review endpoint.
- Show a loading state while saving.
- Display the updated review status after success.
- Display an error if saving fails.
- Allow modification of an existing review decision, consistent with the MVP backend contract.

### Review Queue

The Review tab should prioritize completed generations with review status `unreviewed`.

Previously reviewed generations remain accessible from the Library.

---

# 11. Component Design Guidelines

Create reusable components when the same visual pattern is used in multiple places.

### Recommended Components

| Component | Purpose |
|---|---|
| `AppHeader` | Brand and application header |
| `NavigationTabs` | Create, Library, Review navigation |
| `GenerationForm` | Generation request form |
| `TextInput` | Single-line input |
| `TextArea` | Multiline prompt input |
| `SelectInput` | Ratio and Duration dropdowns |
| `PrimaryButton` | Main actions |
| `StatusBadge` | Generation and review statuses |
| `GenerationCard` | Generation library card |
| `VideoPlayer` | Generated video preview |
| `LoadingIndicator` | Loading state |
| `ErrorMessage` | Validation and API errors |

### Component Rules

- Use TypeScript interfaces for component props.
- Prefer functional React components.
- Use controlled inputs for the Generation Form.
- Keep components focused and understandable.
- Avoid excessive abstraction.
- Do not introduce a general-purpose design-system package for this MVP.

---

# 12. Interaction and Feedback

Every asynchronous action must communicate its current state.

## 12.1 Loading States

Examples:

- `Submitting...`
- `Processing video...`
- `Loading generations...`
- `Saving review...`

Disable repeat submissions while requests are in progress.

## 12.2 Success Feedback

After a successful generation submission:

**Message:** Video generation submitted successfully.

After successful review:

**Message:** Review saved successfully.

Use subtle feedback rather than large modal dialogs.

## 12.3 Error Feedback

Errors should be:

- Clear.
- Actionable.
- Visually consistent.
- Free of unnecessary technical details.

Examples:

- Please enter a project name.
- Please provide a valid HTTPS image URL.
- Unable to submit generation. Please try again.
- Video generation failed.
- Unable to save review.

Do not expose API keys, internal exceptions, or provider credentials in the UI.

## 12.4 Status Updates

Generation status values:

- `pending`
- `processing`
- `completed`
- `failed`

Review status values:

- `unreviewed`
- `approved`
- `rejected`

### Polling

Poll the generation detail endpoint every 3–5 seconds while its status is `pending` or `processing`.

Stop polling when the generation is `completed` or `failed`.

Avoid overlapping requests.

Clean up polling when a component unmounts or the user navigates away.

Do not introduce WebSockets for the MVP.

---

# 13. Responsive Design

StudioFlow must work on desktop, tablet, and mobile.

## Breakpoints

Use Tailwind's standard responsive breakpoints unless there is a specific reason to deviate.

### Desktop — 1024px and Above

- Centered content.
- Two-column form field layouts where specified.
- Three-column generation library when space permits.
- Spacious card padding.

### Tablet — 768px to 1023px

- Reduced outer padding.
- Two-column library.
- Maintain side-by-side form fields when space permits.

### Mobile — Below 768px

- Single-column layout.
- Full-width form controls.
- Stack Project and Shot fields.
- Stack Ratio and Duration dropdowns.
- Make primary actions easily accessible.
- Avoid horizontal scrolling.
- Maintain readable typography.

### Mobile Navigation

Keep all three navigation options visible if space permits.

Do not introduce a hamburger menu for only three navigation items unless genuinely necessary.

---

# 14. Accessibility

Accessibility is a core design requirement.

### Forms

- Every input must have an associated label.
- Required fields must be clearly identified.
- Errors must be associated with the corresponding fields.
- Keyboard navigation must work correctly.
- Focus states must be visible.

### Buttons

- Use semantic HTML buttons.
- Provide accessible names.
- Clearly communicate disabled and loading states.

### Color Contrast

Aim for WCAG AA contrast:

- At least 4.5:1 for normal text.
- At least 3:1 for large text and applicable interactive visual indicators.

Adjust text or control styling where necessary to maintain contrast.

### Status Indicators

Never communicate a status solely through color.

Use readable labels such as `Processing` or `Approved`.

### Motion

- Avoid unnecessary animations.
- Respect reduced-motion preferences.
- Use subtle transitions for hover and focus states.
- Avoid distracting movement near video content.

---

# 15. Frontend Architecture Guidelines

### Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Native Fetch API

### State Management

Use React's built-in state management for the MVP.

Avoid introducing Redux or other global state libraries unless necessary.

### Styling

- Use Tailwind utility classes.
- Define shared design tokens centrally.
- Avoid inline hardcoded colors.
- Avoid unnecessarily complex CSS.
- Maintain consistent spacing, typography, and border radius.

### API Calls

Keep API integration isolated from presentational components.

Recommended structure:

```text
frontend/
├── src/
│   ├── api/
│   │   └── generations.ts
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── NavigationTabs.tsx
│   │   ├── GenerationForm.tsx
│   │   ├── GenerationCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── StatusBadge.tsx
│   ├── pages/
│   │   ├── GeneratePage.tsx
│   │   ├── LibraryPage.tsx
│   │   └── GenerationDetailPage.tsx
│   ├── types/
│   │   └── generation.ts
│   ├── App.tsx
│   └── index.css
```

This structure is recommended, not mandatory. Preserve existing working project conventions when appropriate.

---

# 16. Backend API Integration

The frontend communicates with the existing FastAPI backend.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/generate` | Submit generation |
| GET | `/api/generations` | Fetch generation history |
| GET | `/api/generations/{generation_id}` | Retrieve generation status |
| PATCH | `/api/generations/{generation_id}/review` | Submit review |

## Generation Request

```json
{
  "project_name": "Project Aurora",
  "shot_name": "Opening aerial",
  "prompt_text": "A cinematic aerial shot of a futuristic city at sunrise.",
  "reference_image_url": "https://example.com/frame.png",
  "ratio": "1280:720",
  "duration": 5
}
```

## Generation Submission Response

```json
{
  "generation_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "created_at": "2026-11-21T12:00:00Z"
}
```

### Integration Rules

- Use typed TypeScript request and response interfaces.
- Do not expose the Runway API key in frontend code.
- Do not call Runway directly from the browser.
- Use the FastAPI backend for all generation operations.
- Handle API errors gracefully.
- Do not assume completed videos are available immediately after submission.
- Use the generation ID returned by FastAPI to track each job.
- Maintain separation between generation status and review status.

### Local Development

Use the Vite proxy to forward `/api` requests to FastAPI.

Avoid hardcoding backend URLs inside individual React components.

The backend's implemented OpenAPI schema (`/openapi.json`) is the authoritative source if minor differences exist between examples in this document and the actual running API.

---

# 17. MVP Scope Boundaries

## Included

- Dark cinematic application shell.
- Create, Library, and Review navigation.
- Generation Form.
- Ratio and Duration dropdowns.
- Generation API integration.
- Generation status tracking.
- Generation Library.
- Video preview.
- Approval and rejection.
- Loading and error states.
- Responsive design.

## Explicitly Excluded

- User authentication.
- Team collaboration and permissions.
- Multiple AI provider selection.
- Advanced model tuning.
- Prompt enhancement using AI.
- Timeline-based video editing.
- Video trimming.
- Audio generation.
- Asset management.
- Local file uploads.
- Drag-and-drop media uploads.
- Real-time WebSocket updates.
- Analytics dashboards.
- Billing and credits management.
- Light mode.
- Advanced project and shot management.

Do not implement excluded features unless explicitly requested.

---

# 18. Coding Agent Instructions

These instructions apply to any coding agent implementing the StudioFlow frontend.

### Before Implementation

1. Read this document completely.
2. Review the relevant reference image in `.ai-mocks/`.
3. Inspect the existing frontend structure.
4. Review the backend API contract before implementing API integration.
5. Reuse existing components and dependencies where appropriate.

### During Implementation

1. Match approved visual references as closely as practical.
2. Follow the colors, typography, spacing, and component specifications in this document.
3. Preserve the approved Generation Form field order.
4. Keep business logic separate from presentation.
5. Use TypeScript types for API data.
6. Use semantic HTML and accessible controls.
7. Implement proper loading and error states.
8. Maintain responsive behavior.
9. Avoid unnecessary dependencies.
10. Do not modify the backend unless explicitly requested.

### Avoid

- Unapproved layout redesigns.
- Introducing new color schemes.
- Adding extra form fields.
- Unnecessary animations.
- Excessive gradients and shadows.
- Placeholder buttons that appear functional but do nothing.
- Mock data presented as real backend data.
- Hardcoded API responses.
- Exposing provider credentials.
- Overengineering the component architecture.

### Reference Priority

When implementing the UI, follow this precedence:

1. Explicit requirements from the current task.
2. Functional requirements in this `DESIGN.md`.
3. Approved visual reference images in `.ai-mocks/`.
4. Existing application component conventions.
5. Reasonable implementation defaults.

---

# 19. Acceptance Criteria

## Generation Form

- [ ] Visually matches the approved `.ai-mocks/generation-form.png` reference.
- [ ] Uses the documented dark cinematic palette.
- [ ] Displays Project and Shot Name side by side on desktop.
- [ ] Includes the Creative Prompt textarea.
- [ ] Includes the Reference Image URL input.
- [ ] Includes the Aspect Ratio dropdown.
- [ ] Includes the Duration dropdown.
- [ ] Shows selected generation settings in the summary.
- [ ] Validates all required fields.
- [ ] Submits the correct API payload.
- [ ] Displays loading feedback.
- [ ] Prevents duplicate submissions.
- [ ] Displays API errors clearly.
- [ ] Works on mobile and desktop.

## Generation Library

- [ ] Fetches generation history from FastAPI.
- [ ] Displays generation cards.
- [ ] Shows generation and review statuses.
- [ ] Handles pending, processing, completed, and failed generations.
- [ ] Supports navigation to generation details.
- [ ] Displays an appropriate empty state.

## Generation Review

- [ ] Displays generated videos.
- [ ] Shows original creative prompt and shot metadata.
- [ ] Allows approval.
- [ ] Allows rejection.
- [ ] Supports optional review comments.
- [ ] Persists review decisions through FastAPI.
- [ ] Shows updated review status.
- [ ] Prevents reviewing incomplete generations.

## General Quality

- [ ] No TypeScript compilation errors.
- [ ] No broken navigation.
- [ ] No browser console errors during normal usage.
- [ ] Responsive on desktop and mobile.
- [ ] Accessible form labels and keyboard navigation.
- [ ] Consistent design tokens across screens.
- [ ] No exposed API credentials.
- [ ] No unnecessary dependencies.

---

# 20. Future Design Evolution

After completing the MVP, StudioFlow may evolve to support:

- Multiple shots organized under projects.
- Generation version histories.
- Side-by-side video comparisons.
- Advanced creative controls.
- Reference image upload and asset libraries.
- Team review and collaboration.
- Shot approval workflows.
- Multi-provider AI video generation.
- Production pipeline integration.

These capabilities should extend the existing visual language rather than replace it.

---

## Final Design Principle

**StudioFlow should make AI video generation feel like a natural part of a professional creative production workflow.**

The interface must remain simple enough for quick experimentation while establishing a visual and architectural foundation that can support more sophisticated studio workflows in the future.