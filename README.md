# Weather Information App
This projects entails a weather information app that provides the current weather from a given location.

## Features
- **User Authentication**: Login system with encrypted password
- **Real-time weather updates**: Retrieves weather information from an external API.
- **Database**: SQLite database for storing user credentials

## Installation
The following prerequisites are needed:
- [Docker]
- [Node.js]
- [Kubernetes]
- [Git]

## Steps
### 1. Clone the repo:
```bash
git clone https://github.com/JakobAdamsson/weatherapp.git
```
Navigate to the root folder:
```bash
cd weatherapp
```
### 2. If you are using Linux run the "runme_linux.sh" bash script
```bash
chmod +x runme_linux.sh
./runme_linux.sh
```

### For Windows run the "runme_windows.sh" bash script
```bash
chmod +x runme_windows.sh
./runme_windows.sh
```

NOTE: If you run it on windows, and you get errors about EOF or \r etc, enter this:
```
sed -i 's/\r$//' runme_windows.sh
```
Then re-run ./runme_windows.sh or bash runme_windows


### 3. Done!
The frontend should not be accessable by your webbrowser at: "localhost:80"

### OBS
If the "EXTERNAL_IP" is stuck on pending you may have to run:
```bash
minikube tunnel
```
