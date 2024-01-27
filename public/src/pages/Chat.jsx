import React,{useState,useEffect,useRef} from 'react'
import styled from 'styled-components'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Contacts from "../components/Contacts";
import { allUsersRoute,host } from "../utils/APIRoutes";
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer'
import { io } from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    document.title = 'ThinChat App';
  }, []);
  const navigate = useNavigate()
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isLoaded,setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem('chat-app')) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem('chat-app')));
        setIsLoaded(true);
      }
    };
  
    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render
  


  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          if (currentUser.isAvatarImageSet) {
            const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(data.data);
           }else {
             navigate("/setAvatar");
         }
        } catch (error) {
          console.error('Error fetching data:', error);
          // Handle the error appropriately
        }
      }
    };
  
    fetchData();
  }, [currentUser]);

  const handleChatChange = (chat) =>{
    setCurrentChat(chat)
  }
  

  return (
    <>
      <Container>
        <div className="container">
        <Contacts 
          contacts={contacts} 
          currentUser={currentUser} 
          changeChat={handleChatChange} 
        />
        {
         isLoaded && currentChat === undefined ? (
          <Welcome
          currentUser={currentUser} 
          />) : ( 
            <ChatContainer currentChat={currentChat} 
            currentUser={currentUser} 
            socket={socket}
            />
          )
        }

        
        </div>
      </Container>
    </>
  );
  
  
};

const Container = styled.div`
height: 100vh;
width: 100vw;
display: flex;
flex-direction: column;
justify-content: center;
gap: 1rem;
align-items: center;
background-color: #131324;
.container {
  height: 85vh;
  width: 85vw;
  background-color: #00000076;
  display: grid;
  grid-template-columns: 25% 75%;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-columns: 35% 65%;
  }
}
`;




