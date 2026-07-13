# 🍏 FitVitaCoach: Digital Health & Wellness Operating System

FitVitaCoach is a state-of-the-art, commercial-ready digital wellness platform designed to serve as a complete digital health operating system. Built utilizing Express, Vite, React, Tailwind CSS, and powered server-side by Google Gemini 3.5 Models, it bridges clinical dietary discipline, Sports Science biomechanics, cardiac parameters, and secure HIPAA-compliant document storage into a singular, beautiful glassmorphic experience.

Developed by elite engineers, sports scientists, and certified clinical dietitians under supreme direction, FitVitaCoach represents a massive leap in personal health software.

---

## 🚀 Key Modules & Capabilities

### 1. Unified Health Dashboard (`HomeDashboard`)
- **Interactive Biometrics Scorecard**: High-fidelity visual trackers reflecting active caloric deficits, metabolic hydration levels, sleeping architecture, and step counts.
- **Dynamic Wellness Quotient**: A clinical formula calculating the daily overall health index out of 100 based on water intake, dietary accuracy, and logged physical movements.
- **Micro-logging Engines**: Double-tap active water trackers and rapid snack macro logs with immediate state re-indexing.

### 2. Smart Dietetics & Calorie Diary (`SmartCalorieTracker`)
- **Multi-modal Calorie Logger**: Log standard or regional recipes with strict macronutrient splits (proteins, lipids, carbohydrates).
- **Deep Regional Food Library**: Comprehensive support for local Bangladeshi, Indian, and Middle Eastern recipes (e.g., *Ilish Fish Curry*, *Lal Chal Brown Rice*, *Handmade Atta Roti*).
- **AI Vision Analysis**: Simulated optical scanning of food logs, outputting professional nutritional assessments and potential inflammatory warnings.

### 3. Smart AI Meal Planner (`AIMealPlanner`)
- **Custom Meal-Plan Generation**: Real-time server-side generation utilizing Google Gemini. Recalibrates recipes to accommodate chronic conditions (Diabetes, PCOS, Hypertension) or food allergies.
- **Ingredient Synthesis & Preparation**: Direct step-by-step cooking prep instructions accompanied by clinical nutritional summaries.

### 4. Sports Science & Biomechanics Hub (`FitnessModule`)
- **Guided Movement Library**: Professional kinetic coaching ranging from core Hatha yoga cycles to heavy compound strength templates.
- **Form-Correction Guides**: High-fidelity simulated streaming video playback that details spinal bracing, concentric-eccentric breathing ratios, and joint safety.
- **Personal Records (PR) Tracker**: Log high-performance lifts and metabolic paces.

### 5. Body Composition Analytics (`BodyTracker`)
- **Biometric Progress Charts**: Multi-axis interactive line/area charts plotting weight decline and waist reduction trends over time using `recharts`.
- **BMI Band Calculator**: Automated calculation showing underweight, normal weight, overweight, and obese classifications with responsive color signals.

### 6. Cognitive Wellness Center (`MentalWellness`)
- **Box Breathing Companion**: An interactive, beautifully animated breathing trainer guiding users through classic parasympathetic nerve stimulation (4-4-4 breathing phases: Inhale, Hold, Exhale).
- **Mood and Cortisol Logging**: Visual sliders tracking day-to-day psychological scores, daily gratitude diaries, and deep reflection logs.

### 7. Habit & Routine Coach (`HabitCoach`)
- **Morning & Night Routine Choreography**: Checklists to anchor positive lifestyle habits.
- **Dynamic Streak Tracker**: Flame streak calculators incentivizing sequential days of positive behavior.
- **Premium Challenges**: Seasonal milestones (e.g., "Metabolic Kickstart", "Consistent Hydration") to gain XP.

### 8. Medication & secure HIPAA Vault (`MedicationCenter`)
- **Prescription Schedule Tracker**: Time-triggered medication calendars with dosage metrics and refill alerts.
- **Secure Encrypted Document Vault**: Drag-and-drop secure local vault simulation for vaccination cards, annual cardiac reports, and ECG readouts.

### 9. Auxiliary Wellness Modules (`MoreModules`)
- **Smart Grocery List**: Shopping lists showing estimated prices in BDT, grocery categories, and healthy alternatives.
- **Women's Health**: Approximates ovulation periods, fertile windows, and menstrual symptom diaries.
- **Emergency QR Card**: Generates an emergency profile with medical alerts, allergies, and contacts, scan-ready offline.
- **Doctor/Physician Portal**: Dedicated interface simulating patient queues, compliance rates, and specialist consultations.
- **Wearables Sync Bridge**: High-precision Bluetooth BLE/REST sync simulation for Apple Health, Google Fit, and Fitbit.
- **Accessibility Engine**: Controls for Deuteranopia color-blindness, font-size scaling, and ARIA screen readers.

### 10. 24/7 Virtual Health Coach (`AICoachChat`)
- **Gemini Chat Portal**: Talk to an elite health coach equipped with sports science, dietetics, and cardiac advice. Uses server-side API proxy routing to prevent key exposure.

---

## 🛠️ Technology Stack & Architecture

### Backend
- **Express / Node.js**: Secure, high-speed RESTful API server.
- **Google Gen AI SDK (`@google/genai`)**: Next-generation model orchestration.
- **Esbuild**: Bundles the backend into a high-performance CommonJS `dist/server.cjs` structure, completely bypassing ES Module path problems in production containers.

### Frontend
- **React (v19) / TypeScript (v5)**: Native type-safe UI components.
- **Vite (v6)**: High-speed developer compilation.
- **Tailwind CSS (v4)**: Modern, utility-first UI styling.
- **Recharts**: High-performance interactive SVGs for biometrics visualization.
- **Lucide React**: Clean vector icon asset suite.

---

## 📦 Installation & Developer Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Secrets & Environment
Define your keys in `.env` (refer to `.env.example`):
```env
GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

### 4. Running Development Environment
To start the custom full-stack Express + Vite dev server:
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

### 5. Production Compilation
To compile the full static client-side bundle and compile the Express backend server into the CommonJS bundle:
```bash
npm run build
```

To start the compiled production applet:
```bash
npm run start
```

---

## 🗺️ Project Vision & Roadmap
- **Phase 1**: Core architecture, Express routing, and initial food databases (Completed)
- **Phase 2**: Biometrics integration, Sports Science library, and automated BMI calculators (Completed)
- **Phase 3**: Recharts integration, animated Box Breathing Coach, and secure local file HIPAA upload simulators (Completed)
- **Phase 4**: Real Wearable BLE sync, direct database integration, and localized Bengali/Hindi Voice-AI Coaches (Future Roadmap)

---

Developed under elite direction by **SMI Fahim (Supreme Administrator)**. This application is designed to challenge the landscape of commercial fitness software.
