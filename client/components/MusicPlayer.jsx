import sound from 'C:/Users/julio/Desktop/dev/artificial-intelligence/projects/music-app/public/data/bonjovi.mp3'
import React, { useState, useRef, useEffect } from 'react';


const MusicApp = () => {
    const [playlist, setPlaylist] = useState([]);
    const [track, setTrack] = useState('');
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef();

    useEffect(() => {
        if (typeof window !== 'undefined' && !audioRef.current) {
            audioRef.current = new Audio(sound);

            audioRef.current.addEventListener('timeupdate', () => {
                setCurrentTime(audioRef.current.currentTime);
            });

            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current.duration);
            });
        }
    }, []);

    const addTrack = () => {
        if (track && !playlist.includes(track)) {
            setPlaylist([...playlist, track]);
            setTrack('');
        }
    };

    const removeTrack = (trackToRemove) => {
        if (currentTrack === trackToRemove) stopTrack();
        setPlaylist(playlist.filter(t => t !== trackToRemove));
    };

    const clearPlaylist = () => {
        stopTrack();
        setPlaylist([]);
    };

    const playTrack = (track) => {
        if (currentTrack !== track) {
            audioRef.current.pause();
            audioRef.current.load(sound);
            audioRef.current.play().then(() => setIsPlaying(true));
            setCurrentTrack(track);
        } else if (!isPlaying) {
            audioRef.current.play().then(() => setIsPlaying(true));
        }
    };

    const pauseTrack = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const stopTrack = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const skipTime = (seconds) => {
        let newTime = audioRef.current.currentTime + seconds;
        if (newTime < 0) newTime = 0;
        if (newTime > duration) newTime = duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Spotify-Like Music App</h1>
            <input
                className="border rounded p-2 mb-4"
                type="text"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                placeholder="Enter track name"
            />
            <button onClick={addTrack} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 ml-2">Add Track</button>
            <button onClick={clearPlaylist} className="bg-red-500 text-white px-4 py-2 rounded mb-4 ml-2">Clear Playlist</button>
            <ul className="list-disc ml-4">
                {playlist.map((t, index) => (
                    <li key={index} className="mb-2">
                        {t}
                        <button onClick={() => isPlaying && currentTrack === t ? pauseTrack() : playTrack(t)} className="bg-green-500 text-white px-2 py-1 rounded ml-2">
                            {isPlaying && currentTrack === t ? 'Pause' : 'Play'}
                        </button>
                        <button onClick={() => removeTrack(t)} className="bg-gray-300 text-black px-2 py-1 rounded ml-2">Remove</button>
                        {currentTrack === t && (
                            <div>
                                <input type="range" min="0" max={duration} value={currentTime} onChange={handleSeek} className="w-full mt-2" />
                                <button onClick={() => skipTime(-10)} className="bg-yellow-500 text-white px-2 py-1 rounded ml-2">-10s</button>
                                <button onClick={() => skipTime(10)} className="bg-yellow-500 text-white px-2 py-1 rounded ml-2">+10s</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MusicApp;
