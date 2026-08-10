// Source code pulled from github.com/zelmotas/arduinoprojects
export const sketches: Record<string, string> = {
  reaction: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Initialize the LCD (Address 0x27, 16 columns, 2 rows)
LiquidCrystal_I2C lcd(0x27, 16, 2);

int ledPin[4] = {5, 4, 3, 2};
#define pbPin 6
#define buzzerPin 9

unsigned long start;
unsigned long finalTime;
int randomDelay;

int previousButtonState = HIGH;
int currentButtonState;

// Note frequencies for the waiting song (C4, E4, G4, C5)
int melody[] = {262, 330, 392, 523, 392, 330};
int melodyLength = 6;

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  for(int i = 0; i < 4; i++){
    pinMode(ledPin[i], OUTPUT);
  }

  pinMode(pbPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);

  randomSeed(analogRead(A0));
}

void loop() {
  bool waitingNext = true;
  bool reacting = false;

  // 1. Get Ready phase
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Get Ready...");
  for(int i = 0; i < 4; i++){
    digitalWrite(ledPin[i], HIGH);
    tone(buzzerPin, 440, 200);
    delay(1000);
  }

  // 2. Random delay
  randomDelay = random(2000, 6000);
  delay(randomDelay);

  // 3. Lights out & GO beep!
  for(int i = 0; i < 4; i++){
    digitalWrite(ledPin[i], LOW);
  }
  tone(buzzerPin, 1000, 500);

  // 4. Reacting phase
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PRESS BUTTON!");
  reacting = true;
  start = millis();
  unsigned long lastDisplayUpdate = 0;

  while(reacting) {
    currentButtonState = digitalRead(pbPin);
    unsigned long currentMillis = millis();
    unsigned long elapsed = currentMillis - start;

    if(previousButtonState == HIGH && currentButtonState == LOW) {
      finalTime = elapsed;
      reacting = false;
      tone(buzzerPin, 1500, 100);
    }

    if (reacting && (currentMillis - lastDisplayUpdate >= 50)) {
      lcd.setCursor(0, 1);
      lcd.print(elapsed);
      lcd.print(" ms ");
      lastDisplayUpdate = currentMillis;
    }

    previousButtonState = currentButtonState;
  }

  // 5. Show Final Time
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Reaction Time:");
  lcd.setCursor(0, 1);
  lcd.print(finalTime);
  lcd.print(" ms");
  Serial.print("Reaction Time: ");
  Serial.println(finalTime);
  delay(2000);

  // 6. Restart phase with Dance and Music!
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Press button");
  lcd.setCursor(0, 1);
  lcd.print("to play again!");
  unsigned long lastDanceUpdate = 0;
  int danceStep = 0;

  while (waitingNext) {
    currentButtonState = digitalRead(pbPin);

    if(previousButtonState == HIGH && currentButtonState == LOW){
      waitingNext = false;
      noTone(buzzerPin);
      for(int i = 0; i < 4; i++){
        digitalWrite(ledPin[i], LOW);
      }
    }

    if (waitingNext && (millis() - lastDanceUpdate >= 200)) {
      lastDanceUpdate = millis();
      tone(buzzerPin, melody[danceStep], 100);
      for(int i = 0; i < 4; i++){
        digitalWrite(ledPin[i], LOW);
      }
      int activeLed = danceStep;
      if (activeLed > 3) {
        activeLed = 6 - activeLed;
      }
      digitalWrite(ledPin[activeLed], HIGH);
      danceStep++;
      if (danceStep >= melodyLength) {
        danceStep = 0;
      }
    }

    previousButtonState = currentButtonState;
  }
}
`,
  chess: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Initialize the LCD (Address is usually 0x27 or 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pin Definitions
const int pinR = 11;
const int pinG = 10;
const int pinB = 9;
const int btn1 = 5;  // Player 1 (Red)
const int btn2 = 4;  // Player 2 (Blue)
const int speaker = 8;

// Game States
enum GameState { SETUP, READY, P1_TURN, P2_TURN, GAME_OVER };
GameState state = SETUP;

// Time Settings (in seconds)
const int timeModes[] = {60, 180, 300, 600}; // 1 min, 3 min, 5 min, 10 min
int modeIdx = 0;

// Game Variables
long p1Time = 0;
long p2Time = 0;
unsigned long lastTick = 0;

// Button Debounce & Edge Detection
bool lastBtn1State = HIGH;
bool lastBtn2State = HIGH;

void setup() {
  // Setup Pins
  pinMode(pinR, OUTPUT);
  pinMode(pinG, OUTPUT);
  pinMode(pinB, OUTPUT);
  pinMode(btn1, INPUT_PULLUP);
  pinMode(btn2, INPUT_PULLUP);
  pinMode(speaker, OUTPUT);

  // Setup LCD
  lcd.init();
  lcd.backlight();

  // Enter Setup Mode
  updateSetupDisplay();
  setLED(255, 255, 255); // White LED for setup
}

void loop() {
  bool b1Reading = digitalRead(btn1);
  bool b2Reading = digitalRead(btn2);

  bool b1Pressed = (b1Reading == LOW && lastBtn1State == HIGH);
  bool b2Pressed = (b2Reading == LOW && lastBtn2State == HIGH);

  lastBtn1State = b1Reading;
  lastBtn2State = b2Reading;

  unsigned long now = millis();

  switch (state) {
    case SETUP:
      if (b1Pressed) {
        modeIdx = (modeIdx + 1) % 4;
        updateSetupDisplay();
        beep(50, 1000);
      }
      if (b2Pressed) {
        p1Time = timeModes[modeIdx];
        p2Time = timeModes[modeIdx];
        state = READY;
        updateGameDisplay();
        setLED(0, 255, 0);
        beep(150, 1500);
      }
      break;

    case READY:
      if (b1Pressed) {
        state = P2_TURN;
        lastTick = now;
        setLED(0, 0, 255);
        beep(100, 1200);
      } else if (b2Pressed) {
        state = P1_TURN;
        lastTick = now;
        setLED(255, 0, 0);
        beep(100, 1200);
      }
      break;

    case P1_TURN:
      if (now - lastTick >= 1000) {
        p1Time--;
        lastTick += 1000;
        updateGameDisplay();
        if (p1Time <= 0) { endGame(2); }
      }
      if (b1Pressed) {
        state = P2_TURN;
        setLED(0, 0, 255);
        beep(80, 800);
      }
      break;

    case P2_TURN:
      if (now - lastTick >= 1000) {
        p2Time--;
        lastTick += 1000;
        updateGameDisplay();
        if (p2Time <= 0) { endGame(1); }
      }
      if (b2Pressed) {
        state = P1_TURN;
        setLED(255, 0, 0);
        beep(80, 800);
      }
      break;

    case GAME_OVER:
      if (b1Pressed || b2Pressed) {
        state = SETUP;
        updateSetupDisplay();
        setLED(255, 255, 255);
        beep(100, 1000);
      }
      break;
  }

  delay(10);
}

void setLED(int r, int g, int b) {
  analogWrite(pinR, r);
  analogWrite(pinG, g);
  analogWrite(pinB, b);
}

void beep(int duration, int freq) {
  tone(speaker, freq, duration);
}

void updateSetupDisplay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("P1:Cycle P2:Pick");
  lcd.setCursor(0, 1);
  lcd.print("Time: ");
  lcd.print(timeModes[modeIdx] / 60);
  lcd.print(" min");
}

void updateGameDisplay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Player 1: ");
  formatTime(p1Time);
  lcd.setCursor(0, 1);
  lcd.print("Player 2: ");
  formatTime(p2Time);
}

void formatTime(long t) {
  int m = t / 60;
  int s = t % 60;
  lcd.print(m);
  lcd.print(":");
  if (s < 10) lcd.print("0");
  lcd.print(s);
}

void endGame(int winner) {
  state = GAME_OVER;
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TIME UP!");
  lcd.setCursor(0, 1);
  if (winner == 1) {
    lcd.print("Player 1 Wins!");
    setLED(255, 0, 0);
  } else {
    lcd.print("Player 2 Wins!");
    setLED(0, 0, 255);
  }
  tone(speaker, 400, 500);
  delay(500);
  tone(speaker, 300, 1000);
}
`,
  birthday: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// 1. CREATE THE LCD OBJECT
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setColor(int red, int blue, int green);
void playHappyBirthday(void);

#define redPin    5
#define greenPin  3
#define bluePin   4
#define buzzerPin 8
#define buttonPin 2  // Button connected to Pin 2

int timer = 0;              // Start at 0 seconds
int initialTimer = 0;       // Remembers the starting time for the color fade
unsigned long elapsedSecond = 0;

bool isRunning = false;     // Tracks if we are in Setup Mode or Countdown Mode

// Button tracking variables
int lastButtonState = HIGH;
unsigned long lastClickTime = 0;

void setup() {
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Set Time:      ");

  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // Activates the internal pull-up resistor for the button
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // ==========================================
  // MODE 1: SETUP MODE (Waiting for button)
  // ==========================================
  if (isRunning == false) {
    lcd.setCursor(0, 1);
    lcd.print(timer);
    lcd.print(" Secs  ");

    int currentButtonState = digitalRead(buttonPin);

    // Check if button was just pressed (went from HIGH to LOW)
    if (lastButtonState == HIGH && currentButtonState == LOW) {
      unsigned long pressTime = millis();

      // If the last click was less than 400ms ago, it's a double-click!
      if (pressTime - lastClickTime < 400) {
        isRunning = true;
        initialTimer = timer;
        lcd.setCursor(0, 0);
        lcd.print("Time Remaining:");
        elapsedSecond = millis();
        setColor(0, 255, 0); // Turn on initial Green light
      } else {
        // Single click - add 5 seconds
        timer += 5;
      }
      lastClickTime = pressTime;
      delay(50); // Simple debounce
    }

    lastButtonState = currentButtonState;
  }

  // ==========================================
  // MODE 2: COUNTDOWN MODE
  // ==========================================
  else {
    lcd.setCursor(0, 1);
    lcd.print(timer);
    lcd.print(" Secs  ");

    if (timer == 0){
      lcd.setCursor(0, 0);
      lcd.print("Timer is up!   ");
      while (true) {
        playHappyBirthday();
        delay(2000);
      }
    }

    if (millis() - elapsedSecond > 1000){
      timer--;
      elapsedSecond = millis();
    }

    // Gradual color fade from green -> red
    int halfTime = initialTimer / 2;
    if (timer > halfTime) {
      int redBrightness = map(timer, initialTimer, halfTime, 0, 255);
      setColor(redBrightness, 255, 0);
    } else if (timer > 0) {
      int greenBrightness = map(timer, halfTime, 0, 255, 0);
      setColor(255, greenBrightness, 0);
    } else {
      setColor(255, 0, 0); // Solid Red
    }
  }
}

void setColor(int red, int green, int blue){
  analogWrite(redPin, red);
  analogWrite(bluePin, blue);
  analogWrite(greenPin, green);
}

void playHappyBirthday(void) {
  int melody[] = {
    262, 262, 294, 262, 349, 330,
    262, 262, 294, 262, 392, 349,
    262, 262, 523, 440, 349, 330, 294,
    466, 466, 440, 349, 392, 349
  };
  int noteDurations[] = {
    250, 250, 500, 500, 500, 1000,
    250, 250, 500, 500, 500, 1000,
    250, 250, 500, 500, 500, 500, 1000,
    250, 250, 500, 500, 500, 1000
  };

  for (int i = 0; i < 25; i++) {
    if (i % 2 == 0) {
      lcd.backlight();
      setColor(255, 0, 0);
    } else {
      lcd.noBacklight();
      setColor(0, 0, 0);
    }
    int duration = noteDurations[i];
    tone(buzzerPin, melody[i], duration);
    int pauseBetweenNotes = duration * 1.30;
    delay(pauseBetweenNotes);
    noTone(buzzerPin);
  }

  lcd.backlight();
  setColor(255, 0, 0);
}
`,
  alarm: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // Change 0x27 to 0x3F if screen is blank

// --- PIN DEFINITIONS ---
#define pirPin      2
#define armButton   4
#define disarmButton 5
#define sirenPin    7
#define beepPin     8
#define bluePin     9
#define greenPin    10
#define redPin      11
#define potPin      A0

// --- SYSTEM STATES ---
enum SystemState { DISARMED, ARMING, ARMED, ALARM };
SystemState currentState = DISARMED;

unsigned long stateTimer = 0;
unsigned long flashTimer = 0;
bool flashState = false;
int countdown = 10;

// --- PIR MOTION FILTER VARIABLES ---
unsigned long motionStartTime = 0;
bool isDetectingMotion = false;

// --- COMBINATION LOCK VARIABLES ---
int secretCode[3] = {4, 2, 7}; // <--- CHANGE YOUR PASSCODE HERE!
int enteredCode[3] = {0, 0, 0};
int currentDigit = 0;
int previousDisarmState = HIGH;

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  pinMode(pirPin, INPUT);
  pinMode(armButton, INPUT_PULLUP);
  pinMode(disarmButton, INPUT_PULLUP);
  pinMode(sirenPin, OUTPUT);
  pinMode(beepPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  lcd.setCursor(0, 0);
  lcd.print("Calibrating PIR.");
  delay(3000);
  setLED(0, 1, 0);
}

void loop() {
  unsigned long currentMillis = millis();

  // Look for a single "click" of the Select button
  int disarmButtonState = digitalRead(disarmButton);
  bool selectPressed = (previousDisarmState == HIGH && disarmButtonState == LOW);
  previousDisarmState = disarmButtonState;

  // ---------------------------------------------------------
  // STATE 1: DISARMED
  // ---------------------------------------------------------
  if (currentState == DISARMED) {
    lcd.setCursor(0, 0);
    lcd.print("System Ready    ");
    lcd.setCursor(0, 1);
    lcd.print("Press to Arm    ");
    setLED(0, 1, 0); // Green
    digitalWrite(sirenPin, LOW);

    if (digitalRead(armButton) == LOW) {
      currentState = ARMING;
      countdown = 10;
      currentDigit = 0;
      isDetectingMotion = false;
      stateTimer = currentMillis;
      tone(beepPin, 1000, 200);
      delay(300);
      lcd.clear();
    }
  }

  // ---------------------------------------------------------
  // STATE 2: ARMING (Countdown)
  // ---------------------------------------------------------
  else if (currentState == ARMING) {
    lcd.setCursor(0, 0);
    lcd.print("Arming in:      ");
    lcd.print(countdown);
    lcd.print("  ");
    setLED(1, 1, 0); // Yellow

    if (currentMillis - stateTimer >= 1000) {
      stateTimer = currentMillis;
      countdown--;
      tone(beepPin, 600, 100);
    }

    if (countdown <= 0) {
      currentState = ARMED;
      tone(beepPin, 1500, 600);
      lcd.clear();
    }
  }

  // ---------------------------------------------------------
  // STATES 3 & 4: ARMED or ALARM
  // ---------------------------------------------------------
  else if (currentState == ARMED || currentState == ALARM) {
    int potValue = analogRead(potPin);
    int dialNumber = map(potValue, 0, 1023, 0, 9);

    if (currentState == ARMED) {
      setLED(1, 0, 0); // Solid Red

      if (isDetectingMotion) {
        unsigned long elapsed = currentMillis - motionStartTime;
        int msLeft = 2000 - elapsed;
        if (msLeft < 0) msLeft = 0;
        lcd.setCursor(0, 0);
        lcd.print("Motion! ");
        lcd.print(msLeft);
        lcd.print("ms  ");
      } else {
        lcd.setCursor(0, 0);
        lcd.print("SYSTEM ARMED    ");
      }

      if (digitalRead(pirPin) == HIGH) {
        if (isDetectingMotion == false) {
          isDetectingMotion = true;
          motionStartTime = currentMillis;
        } else if (currentMillis - motionStartTime >= 2000) {
          currentState = ALARM;
          currentDigit = 0;
          Serial.println("NOTIFY_PHONE");
          isDetectingMotion = false;
          lcd.clear();
        }
      } else {
        isDetectingMotion = false;
      }

    } else if (currentState == ALARM) {
      lcd.setCursor(0, 0);
      lcd.print("! INTRUDER !    ");
      digitalWrite(sirenPin, HIGH);

      if (currentMillis - flashTimer >= 100) {
        flashTimer = currentMillis;
        flashState = !flashState;
        if (flashState) setLED(1, 0, 0);
        else setLED(0, 0, 1);
      }
    }

    // Code interface on bottom line
    lcd.setCursor(0, 1);
    lcd.print("Code: ");
    for (int i = 0; i < 3; i++) {
      if (i < currentDigit) {
        lcd.print("* ");
      } else if (i == currentDigit) {
        lcd.print(dialNumber);
        lcd.print(" ");
      } else {
        lcd.print("_ ");
      }
    }
    lcd.print(" ");

    // Handle Password Select Button
    if (selectPressed) {
      enteredCode[currentDigit] = dialNumber;
      currentDigit++;
      tone(beepPin, 1200, 100);

      if (currentDigit == 3) {
        if (enteredCode[0] == secretCode[0] &&
            enteredCode[1] == secretCode[1] &&
            enteredCode[2] == secretCode[2]) {
          currentState = DISARMED;
          isDetectingMotion = false;
          tone(beepPin, 2000, 500);
          lcd.clear();
        } else {
          currentDigit = 0;
          tone(beepPin, 150, 1000);
          if (currentState == ARMED) {
            currentState = ALARM;
            Serial.println("NOTIFY_PHONE");
          }
        }
      }
    }
  }
}

void setLED(int r, int g, int b) {
  digitalWrite(redPin, r);
  digitalWrite(greenPin, g);
  digitalWrite(bluePin, b);
}
`,
  gate: `#include <Servo.h>

// Pin Definitions
const int trigPin  = 3;
const int echoPin  = 2;
const int servoPin = 7;

// Variables
long duration;
int distance;
Servo myServo;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  myServo.attach(servoPin);
  myServo.write(180); // Ensure it starts at "Open" (180 degrees)
}

void loop() {
  // 1. Get distance reading
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // 2. Trigger at 23cm or closer
  if (distance > 0 && distance <= 23) {
    Serial.println("Object detected! Closing...");
    delay(1000);
    myServo.write(75);   // Close gate
    delay(7000);         // Stay closed for 7 seconds
    Serial.println("Reopening...");
    myServo.write(180);  // Reopen
  }

  delay(100); // Stabilize sensor readings
}
`,
};
