import React, { useState, useRef, useEffect } from 'react';
import MusicApp from './MusicPlayer';
import logo from "/assets/image.png";

const sessionUpdate = {
    type: "session.update",
    session: {
        tools: [
            {
                type: "function",
                name: "addTrack",
                description: "Add a new track to the playlist",
                parameters: {
                    type: "object",
                    properties: {
                        track: {
                            type: "string",
                            description: "Name of the track to add"
                        }
                    },
                    required: ["track"]
                }
            },
            {
                type: "function",
                name: "removeTrack",
                description: "Remove a track from the playlist",
                parameters: {
                    type: "object",
                    properties: {
                        trackToRemove: {
                            type: "string",
                            description: "Name of the track to remove"
                        }
                    },
                    required: ["trackToRemove"]
                }
            },
            {
                type: "function",
                name: "clearPlaylist",
                description: "Clear all tracks from the playlist",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                type: "function",
                name: "playTrack",
                description: "Play the selected track",
                parameters: {
                    type: "object",
                    properties: {
                        track: {
                            type: "string",
                            description: "Name of the track to play"
                        }
                    },
                    required: ["track"]
                }
            },
            {
                type: "function",
                name: "pauseTrack",
                description: "Pause the currently playing track",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                type: "function",
                name: "stopTrack",
                description: "Stop the currently playing track and reset",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                type: "function",
                name: "handleSeek",
                description: "Seek to a specific time in the current track",
                parameters: {
                    type: "object",
                    properties: {
                        time: {
                            type: "number",
                            description: "The time in seconds to seek to"
                        }
                    },
                    required: ["time"]
                }
            },
            {
                type: "function",
                name: "skipTime",
                description: "Skip forward or backward in the current track",
                parameters: {
                    type: "object",
                    properties: {
                        seconds: {
                            type: "number",
                            description: "Number of seconds to skip, positive for forward, negative for backward"
                        }
                    },
                    required: ["seconds"]
                }
            }
        ]
    }
};

export default function App() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [dataChannel, setDataChannel] = useState(null);
    const [toolsConfigured, setToolsConfigured] = useState(false);
    const peerConnection = useRef(null);
    const audioElement = useRef(null);
  
    const updatePlaylist = (action, track) => {
        switch (action) {
            case 'add':
            if (track && !playlist.includes(track)) {
                setPlaylist([...playlist, track]);
                setTrack(''); // Limpa o campo de entrada
                sendClientEvent({
                type: 'response.create',
                response: {
                    instructions: `Confirme de forma natural que a música "${track}" foi adicionada à playlist.`,
                },
                });
            }
            break;
        
            case 'remove':
            if (currentTrack === track) stopTrack();
            setPlaylist(playlist.filter(t => t !== track));
            sendClientEvent({
                type: 'response.create',
                response: {
                instructions: `Confirme de forma natural que a música "${track}" foi removida da playlist.`,
                },
            });
            break;
        
            case 'clear':
            stopTrack(); // Para qualquer música em execução
            setPlaylist([]);
            sendClientEvent({
                type: 'response.create',
                response: {
                instructions: `Confirme de forma natural que a playlist foi limpa.`,
                },
            });
            break;
        
            case 'play':
            if (currentTrack !== track) {
                audioRef.current.pause();
                audioRef.current.load();
                audioRef.current.play().then(() => setIsPlaying(true));
                setCurrentTrack(track);
                sendClientEvent({
                type: 'response.create',
                response: {
                    instructions: `Confirme de forma natural que a música "${track}" está tocando.`,
                },
                });
            } else if (!isPlaying) {
                audioRef.current.play().then(() => setIsPlaying(true));
                sendClientEvent({
                type: 'response.create',
                response: {
                    instructions: `Confirme de forma natural que a reprodução da música "${track}" foi retomada.`,
                },
                });
            }
            break;
        
            case 'pause':
            audioRef.current.pause();
            setIsPlaying(false);
            sendClientEvent({
                type: 'response.create',
                response: {
                instructions: `Confirme de forma natural que a música "${track}" foi pausada.`,
                },
            });
            break;
        
            default:
            console.warn('Ação desconhecida:', action);
            break;
        }
    };
      
  
    const handleFunctionCall = (output) => {
        console.log('🎧 Function Call:', {
        name: output.name,
        arguments: JSON.parse(output.arguments),
        });
    
        const params = JSON.parse(output.arguments);
    
        switch (output.name) {
        case 'add_track': {
            if (params.track_name && !playlist.includes(params.track_name)) {
            setPlaylist([...playlist, params.track_name]);
            console.log(`🎶 Faixa "${params.track_name}" adicionada à playlist.`);
            }
            break;
        }
    
        case 'remove_track': {
            if (playlist.includes(params.track_name)) {
            removeTrack(params.track_name);
            console.log(`❌ Faixa "${params.track_name}" removida da playlist.`);
            }
            break;
        }
    
        case 'play_track': {
            if (playlist.includes(params.track_name)) {
            playTrack(params.track_name);
            console.log(`▶️ Tocando a faixa "${params.track_name}".`);
            }
            break;
        }
    
        case 'pause_track': {
            if (isPlaying && currentTrack === params.track_name) {
            pauseTrack();
            console.log(`⏸️ Faixa "${params.track_name}" pausada.`);
            }
            break;
        }
    
        case 'clear_playlist': {
            clearPlaylist();
            console.log('🗑️ Playlist limpa.');
            break;
        }
    
        case 'skip_time': {
            if (params.seconds) {
            skipTime(params.seconds);
            console.log(`⏩ Pular ${params.seconds} segundos.`);
            }
            break;
        }
    
        case 'seek_time': {
            if (params.time) {
            handleSeek({ target: { value: params.time } });
            console.log(`⏱️ Pulou para ${params.time} segundos.`);
            }
            break;
        }
    
        case 'get_playlist':
            console.log('🎼 Playlist atual:', playlist);
            break;
    
        default:
            console.warn('Ação desconhecida:', output.name);
            break;
        }
    };
  
  
    function sendClientEvent(message) {
      if (dataChannel) {
        if (message.type === "tools.configure") {
          console.log('🔧 Configuring tools');
        }
        dataChannel.send(JSON.stringify(message));
      }
    }
  
    async function startSession() {
      try {
        const tokenResponse = await fetch("/token");
        const data = await tokenResponse.json();
        console.log(data);
        const EPHEMERAL_KEY = data.client_secret.value;
  
        const pc = new RTCPeerConnection();
  
        audioElement.current = document.createElement("audio");
        audioElement.current.autoplay = true;
        pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);
  
        const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
        pc.addTrack(ms.getTracks()[0]);
  
        const dc = pc.createDataChannel("oai-events");
        setDataChannel(dc);
  
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
  
        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
        });
  
        const answer = {
          type: "answer",
          sdp: await sdpResponse.text(),
        };
        await pc.setRemoteDescription(answer);
  
        peerConnection.current = pc;
      } catch (error) {
        console.error('Error starting session:', error);
      }
    }
  
    function stopSession() {
      if (dataChannel) {
        dataChannel.close();
      }
  
      peerConnection.current?.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
  
      if (peerConnection.current) {
        peerConnection.current.close();
      }
  
      setIsSessionActive(false);
      setDataChannel(null);
      peerConnection.current = null;
      setToolsConfigured(false);
    }
  
    useEffect(() => {
      if (dataChannel) {
        const handleMessage = (e) => {
          const event = JSON.parse(e.data);
          
          // Configure tools after session is created
          if (!toolsConfigured && event.type === "session.created") {
            sendClientEvent(sessionUpdate);
            setToolsConfigured(true);
          }
  
          // Handle function calls in responses
          if (event.type === "response.done" && event.response.output) {
            event.response.output.forEach(output => {
              if (output.type === "function_call") {
                handleFunctionCall(output);
              }
            });
          }
        };
  
        const handleError = (error) => {
          console.error('Data channel error:', error);
        };
  
        dataChannel.addEventListener("open", () => {
          setIsSessionActive(true);
        });
        dataChannel.addEventListener("message", handleMessage);
        dataChannel.addEventListener("error", handleError);
  
        // Cleanup function to remove event listeners
        return () => {
          dataChannel.removeEventListener("message", handleMessage);
          dataChannel.removeEventListener("error", handleError);
        };
      }
    }, [dataChannel, toolsConfigured]);
  
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
            <img className="w-6 h-6" src={logo} alt="OpenAI Logo" />
            <h1 className="ml-4 text-xl font-semibold">Voice Player Assistant</h1>
          </div>
        </nav>
  
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <button
                onClick={isSessionActive ? stopSession : startSession}
                className={`px-8 py-4 rounded-full text-white text-lg font-medium transition-all ${
                  isSessionActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSessionActive ? 'End Call' : 'Start Call'}
              </button>
              {isSessionActive && (
                <p className="mt-4 text-green-600">Voice assistant is active and listening...</p>
              )}
            </div>
  
            <div className="bg-white rounded-lg shadow">
              <MusicApp />
            </div>
          </div>
        </main>
      </div>
    );
  }