# Project ideas

<h3> <span style="background-color: #f8d7da;
    color: red;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px; font-size: 1rem;">GPT cant do shit!</span> Suggested by my bro gemini
</h3>

**User Interface and User Experience (UI/UX) Enhancements:**

* **Improved Audio Recording Interface:**  Design a user-friendly interface for recording audio, including options to adjust recording length, visualize sound levels, and add basic editing functionalities (trimming silence). Record audio button on long press opens a menu with eventual options (start recording and end it after x seconds without having to press again the button, etc)
* **Interactive Map:** Implement features on the map view like clustering markers for better visualization in dense areas, allowing users to zoom in and out for detailed exploration, or displaying heatmaps to represent areas with high music activity.
* **Offline Functionality:** Enhance the offline experience by allowing users to see their uploaded songs and explore previously viewed areas on the map even without an internet connection.
* **Advanced Search and Filtering (local):**  While you can't filter based on backend data, allow users to search and filter their own uploaded songs based on local information you store, such as creation date or location.
* **In-App Tutorials:**  Integrate short tutorials or tooltips within the app to guide users through the functionalities, especially for first-time users.
* **Personalized Settings:**  Provide options for users to personalize their experience, such as choosing their preferred map view or enabling/disabling sound effects.

**Data Visualization and Exploration:**

* **Statistical Overlays:**  Overlay basic statistics on the map, like the number of recordings in a particular area or the most popular genres found in different locations (based on data retrieved from successful uploads).
* **Audio Playback Integration:**  If audio files are stored locally after upload, implement a basic audio player within the app to allow users to listen back to their uploaded recordings directly.
* **Charts and Graphs:**  Present data about uploaded music in a visually appealing way using charts or graphs. This could involve showcasing the most common genres, moods, or instruments found across the city.

## Interface

- Main view: map, with markers, icons, etc
- Profile page: user info, uploaded songs, etc
  - notifications menu
  - settings menu
- input menu: record, upload, etc

## Libraries

- React native
  - react-native-maps
    - openstreetmap
    - overpass-turbo
  - moti (framer-motion)
  - nativewind (tailwind)
  - react-native-paper (UI components)
  - [database](https://medium.com/@dubaidevmarketing/top-10-local-databases-for-react-native-app-development-in-2023-5944bb58042e)

## Optional Features

- Use shazam-kit to identify songs, store locally
- use musixmatch api to get lyrics for songs

