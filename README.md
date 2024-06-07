# Socrimoft Dowins XP

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fdowins-xp.pages.dev%2F&label=Clouflare%20Pages&logo=cloudflarepages)](https://dowins-xp.pages.dev)


## Description

Source code of Socrimoft Dowins XP (web version). 
Shipped with :
- ~~Explorer of the internet 8~~ (not working)
- Command Prompt
- Hangman Game
- Media center
- 3D Pinball

## Installation
Make sure you have [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your system before running these commands.  
To install this project, you can follow these steps:

1. Clone the repository:
    ```
    git clone https://github.com/Loic-An/dowins-xp.git
    ```
2. Change to the project directory:
    ```
    cd dowins-xp
    ```

3. Install the dependencies:
    ```
    npm install
    ```

You are now ready to start the application!

## Usage

To start the application, run :
```
npm start
```

(if you encountered an error saying that the port 8000 cannot be bound, either another app is already the port 8000, or that another instance of the app is running or did not close gracefully)  
To close all instances of the app - and by extends all apps using `workerd` -, run :
```
npm stop
```

After starting the application, just start your favourite browser and go to http://localhost:8000/

## Contributing

You're free to submit issues and/or PRs, but I probably won't do anything about it as this project's deadline is June 7, 2024.

## Credits

This project use assets that i do not own :
- Lots of images are extracted and/or altered and originally made by Microsoft
- This is also true for sounds
- [3D Pinball](https://github.com/alula/SpaceCadetPinball)