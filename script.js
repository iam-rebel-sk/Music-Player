
let currentSong = new Audio();
let songs;
let currentFolder;
async function getSongs(folder) {
    currentFolder = folder;

    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let lists = div.getElementsByTagName("li");

    let aOfSongs = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < aOfSongs.length; index++) {
        const element = aOfSongs[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1]);
        }
    }

    // show all songs
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        let songName = song.replace("/", "").replaceAll("%20", " ").replaceAll(".mp3", "");
        songUl.innerHTML = songUl.innerHTML + `<li>
                                   <img class="invert" src="svgs/music.svg" alt="">
                                   <div class="info">
                                       <div class="song-title">${songName}</div>
                                       <div class="artist">Artist</div>
                                   </div>
                                   <img class="invert" id = "playNow" src="svgs/play-song.svg" alt="">
                               </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currentFolder}` + track + ".mp3";
    if (!pause) {
        currentSong.play();
        play.src = "svgs/pause-song.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace("/", ""));
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // show all songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""

    for (const song of songs) {
        let songName = song.replace("/", "").replaceAll("%20", " ").replaceAll(".mp3", "");

        songUl.innerHTML = songUl.innerHTML + `<li>
                                <img class="invert" src="svgs/music.svg" alt="">
                                <div class="info">
                                    <div class="song-title">${songName}</div>
                                    <div class="artist">Artist</div>
                                </div>
                                <img class="invert" id = "playNow" src="svgs/play-song.svg" alt="">
                            </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

}
async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let card_container = document.querySelector(".card_container")
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0]);

            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            card_container.innerHTML = card_container.innerHTML + `<div data-folder = ${folder} class="card roboto-regular">
            <div class="play">
                <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                    class="Svg-sc-ytk21e-0 bneLcE">
                    <path
                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                    </path>
                </svg>
            </div>
            <img class="card-img" aria-hidden="false" draggable="false" loading="lazy"
                src="/songs/${folder}/cover.jpeg" alt="">
            <h3>${response.title}</h3>
            <p>${response.artist}</p>
        </div>`;
        }
    }

    //load playlist of card whenever its clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}/`);
            playMusic(songs[0].replace(".mp3", ""));
        })
    });
}


async function main() {
    await getSongs(`songs/Rebel/`);
    playMusic(songs[0].replaceAll("%20", " ").replaceAll(".mp3", ""), true)

    //display all the albums in the page
    displayAlbums();

    //Attach a event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svgs/pause-song.svg";
        }
        else {
            currentSong.pause();
            play.src = "svgs/play-song.svg";
        }
    })
    function secondsToMinSec(seconds) {

        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        seconds = Math.floor(seconds); // Convert to integer to remove milliseconds
        let min = Math.floor(seconds / 60);
        let hour = Math.floor(min / 60);
        let sec = seconds % 60;

        // Add leading zero if sec is a single digit
        sec = sec < 10 ? '0' + sec : sec;
        if (min > 60) {
            return '0' + hour + ':' + min + ':' + sec;
        }
        return '0' + min + ':' + sec;
    }


    //listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinSec(currentSong.currentTime)} / ${secondsToMinSec(currentSong.duration)}`;
        document.querySelector(".circle").style.left = ((currentSong.currentTime / currentSong.duration) * 100) - 1 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (percent) - 1 + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // add eventlistner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".right").style.filter = "blur(5px)";
        document.querySelector(".right").style.transition = "filter .7s";
    })

    //add evenlistner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
        document.querySelector(".right").style.filter = "none";
    })


    previous.addEventListener("click", () => {
        let currentFileName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFileName);

        try {
            if (index > 0) {
                let name = songs[index - 1].replace(".mp3", "");
                playMusic(name);
            }
        } catch (error) {

        }

    });

    next.addEventListener("click", () => {
        let currentFileName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFileName);

        try {
            if (index < songs.length) {
                let name = songs[index + 1].replace(".mp3", "");
                playMusic(name);
            }
        } catch (error) {
        }

    });

    let currentVolume;
    //Add event listner to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        currentVolume = currentSong.volume;
    })
    
    // add eventlistner to mute the volume
    document.querySelector(".vloume>img").addEventListener("click", e =>{
        if(e.target.src.includes("volume.svg")){
            e.target.src =  e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            try {
                currentSong.volume = currentVolume;
            } catch (error) {
                
            }
            
            document.querySelector(".range").getElementsByTagName("input")[0].value = currentVolume*100;
        }
    })




}
main();
