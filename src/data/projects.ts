export type Project = {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  summary: string;
  folder: string;
  file: string;
  sketchKey: string;
  hardware: string[];
  concepts: string[];
  pins: { pin: string; label: string }[];
  accent: "signal" | "solder" | "danger";
};

export const projects: Project[] = [
  {
    slug: "f1-reaction-time",
    index: "01",
    title: "F1 Reaction Time Game",
    tagline: "Lights out and away we go",
    summary:
      "Four red start lights come up one by one, hold for a randomised 2–6 second gap, then drop. The clock starts on lights-out and stops on the button edge — millisecond accurate, no delay() in the hot loop.",
    folder: "01_F1_ReactionTimeGame",
    file: "ReactionTimegame.ino",
    sketchKey: "reaction",
    hardware: ["4x Red LED", "Push button", "Piezo buzzer", "16x2 I2C LCD"],
    concepts: ["random()", "Edge-detect debounce", "millis() precision timing"],
    pins: [
      { pin: "D2–D5", label: "LED array" },
      { pin: "D6", label: "Button (pullup)" },
      { pin: "D9", label: "Buzzer" },
      { pin: "0x27", label: "LCD I2C" },
    ],
    accent: "danger",
  },
  {
    slug: "blitz-chess-timer",
    index: "02",
    title: "Blitz Chess Timer",
    tagline: "Two clocks, one state machine",
    summary:
      "A five-state machine (SETUP → READY → P1 → P2 → GAME_OVER) drives two independent countdowns with 1/3/5/10 minute controls, an RGB status LED that follows the side to move, and a buzzer on the flag.",
    folder: "02_BlitzChessTimer",
    file: "Chesstimer.ino",
    sketchKey: "chess",
    hardware: ["16x2 I2C LCD", "2x Push button", "RGB LED", "Piezo speaker"],
    concepts: ["enum state machine", "Non-blocking tick accumulator", "Edge detection"],
    pins: [
      { pin: "D4/D5", label: "Player buttons" },
      { pin: "D9–D11", label: "RGB LED" },
      { pin: "D8", label: "Speaker" },
      { pin: "0x27", label: "LCD I2C" },
    ],
    accent: "signal",
  },
  {
    slug: "birthday-countdown",
    index: "03",
    title: "Birthday Countdown",
    tagline: "Single button, double click, full party",
    summary:
      "One button sets the timer with single clicks and arms it with a double click inside 400 ms. The RGB LED fades across the whole countdown as a progress bar, then the piezo plays Happy Birthday at zero.",
    folder: "03_BirthdayCountdown",
    file: "Birthdaycountdown.ino",
    sketchKey: "birthday",
    hardware: ["16x2 I2C LCD", "RGB LED", "Piezo buzzer", "Push button"],
    concepts: ["Double-click detection", "Colour interpolation", "Tone sequencing"],
    pins: [
      { pin: "D2", label: "Button (pullup)" },
      { pin: "D3/D4/D5", label: "RGB LED" },
      { pin: "D8", label: "Buzzer" },
      { pin: "0x27", label: "LCD I2C" },
    ],
    accent: "solder",
  },
  {
    slug: "motion-desk-alarm",
    index: "04",
    title: "Motion Desk Alarm",
    tagline: "PIR tripwire with a passcode lock",
    summary:
      "Arm the desk, get a ten second exit countdown, then a filtered PIR watch. A trip fires the siren and pushes a serial event to a Python listener that forwards a phone notification. Disarm needs the three digit code dialled in on the potentiometer.",
    folder: "04_MotionDeskAlarm",
    file: "alarm.ino",
    sketchKey: "alarm",
    hardware: ["PIR sensor", "Potentiometer", "Siren + beeper", "RGB LED", "LCD"],
    concepts: ["Sensor debounce filter", "Combination lock", "Serial → Python bridge"],
    pins: [
      { pin: "D2", label: "PIR" },
      { pin: "D4/D5", label: "Arm / Select" },
      { pin: "D7/D8", label: "Siren / Beep" },
      { pin: "A0", label: "Potentiometer" },
    ],
    accent: "danger",
  },
  {
    slug: "ultrasonic-servo-gate",
    index: "05",
    title: "Ultrasonic Servo Gate",
    tagline: "Ping, measure, close",
    summary:
      "An HC-SR04 pings every 100 ms and converts echo width to centimetres with duration × 0.034 / 2. Anything inside 23 cm swings the servo from 180° to 75°, holds the gate shut for seven seconds, then reopens.",
    folder: "05_UltrasonicServoGate",
    file: "Ultrasonicsensor.ino",
    sketchKey: "gate",
    hardware: ["HC-SR04 ultrasonic", "SG90 servo", "Arduino Uno"],
    concepts: ["pulseIn() echo timing", "Time-of-flight math", "Servo actuation"],
    pins: [
      { pin: "D3", label: "Trig" },
      { pin: "D2", label: "Echo" },
      { pin: "D7", label: "Servo" },
    ],
    accent: "signal",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const REPO_URL = "https://github.com/zelmotas/arduinoprojects";
