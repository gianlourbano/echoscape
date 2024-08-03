# Project specs

- [ ] authentication
  - [ ] check all cases
    - [ ] login
    - [ ] audios recorded in filesystem
  - [ ] show errors properly
- [ ] record audio
  - [ ] check if network is available, otherwise schedule it for later
  - [ ] check the audio and replay it before uploading
  - [ ] discard audio
  - [ ] upload audio
  - [ ] store audio locally
  - [ ] if not wifi, ask user to confirm upload
  - [ ] notification when network (wifi?) becomes available
  - [ ] save backend info locally
- [ ] managment of auploaded audio
  - [ ] hide/show audio for other users
  - [ ] visualize saved audio and relative data (even offline)
  - [ ] delete audio from backend with api
- [ ] map
  - [ ] fetch markers -> show them on map -> cluster based on zoom level
  - [ ] click on marker -> fetch audio data and cache it
  - [ ] [OPTIONAL] fetch based on zoom level -> filter based on some criteria (e.g. only show dance music)

## [EXTENSIONS] Project Extensions

- [ ] audio upload
  - [ ] choose to assign audio to a POI based on vicinity
- [ ] Paths
  - [ ] assign audios on a path to POIs (based on vicinity) (at least 3 types of POIs)
  - [ ] show places that are not yet geotagged

## [IDEAS] Project Ideas

- [ ] graphs and statitics about uploaded music
  - [ ] user data: songs uploaded from the user
    - [ ] classic graphs
    - [ ] shareable information cards regarding your music tastes
  - [ ] all users data: songs uploaded from all other users in an area
- [ ] heatmap with song information data 