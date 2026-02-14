# SignLingo - Sign Language Detection & Learning Platform

A real-time sign language detection and learning application built with Next.js, MediaPipe, and WebRTC.

## Features

- **Real-time ASL Alphabet Detection**: Detects all 26 ASL alphabet letters using your webcam and MediaPipe hand tracking
- **Comprehensive Learning Module**: 
  - Interactive flashcards for all ASL alphabets (A-Z) with real images
  - Common sign language words and phrases
  - Text-to-Speech (TTS) for pronunciation
- **Video Call with Translation**: Video call interface with real-time Speech-to-Text (STT) captions
- **Bilingual Support**: Full support for English and Hindi languages
- **Beautiful UI**: Modern glassmorphism design with smooth animations

## ASL Alphabet Detection

The app can detect all 26 letters of the American Sign Language alphabet in real-time:

- **Static Letters**: A, B, C, D, E, F, G, H, I, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y
- **Dynamic Letters**: J, Z (detected in static position with motion indication)

For detailed instructions on how to make each sign, see [ASL_GUIDE.md](./ASL_GUIDE.md)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Webcam for detection features

### Installation

1.  Navigate to the project directory:
    ```bash
    cd D:\sign-language-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

1.  Start the development server:
    ```bash
    npm run dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) in your browser.

3.  Allow camera access when prompted for the detection feature.

## How to Use

### Learning Mode
1. Navigate to the **Learn** page
2. Choose between **Alphabets** and **Words** tabs
3. Click on any card to hear the pronunciation
4. Study the hand gestures shown in the images

### Detection Mode
1. Navigate to the **Detect** page
2. Allow camera access
3. Make ASL alphabet signs in front of the camera
4. See real-time detection results
5. Refer to the ASL Guide for proper hand positions

### Video Call Mode
1. Navigate to the **Meet** page
2. Start a video call session
3. Use the chat and speech-to-text features
4. Communicate with real-time captions

## Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom CSS (Glassmorphism design)
- **ML/AI**: MediaPipe Tasks Vision for hand tracking and gesture recognition
- **Icons**: Lucide React
- **Webcam**: React Webcam
- **Language**: TypeScript

## Detection Accuracy

The ASL alphabet detection uses advanced hand landmark analysis to identify:
- Finger positions and extensions
- Thumb orientation
- Hand shape and curvature
- Relative distances between fingers
- Hand orientation

For best results:
- Use good lighting
- Keep hand 1-2 feet from camera
- Make clear, distinct gestures
- Hold each sign steady for 1-2 seconds

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- ASL alphabet images from SigningSavvy
- MediaPipe for hand tracking technology
- Next.js team for the amazing framework

