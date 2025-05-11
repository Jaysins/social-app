export interface Participant{
    user: string;
    username: string;
    status?: "online" | "offline"

  }
  

  export interface UIMessage {
    id: string
    tempId?: string
    temp?: boolean
    sender: Participant
    content: string
    time: string
    isMine: boolean
    read: boolean
  }



  export interface Conversation {
    id: string
    groupName?: string
    lastMessage: string
    type: "direct" | "group"
    userId?: string
    members?: string[]
    messages?: UIMessage[]
    participants: Participant[]
    target: Participant
  }
  
  type FriendStatus = 'none' | 'pending-sent' | 'pending-received' | 'accepted'
  type UserStatus = 'online' | 'offline'
  
  export interface People {
    id: string
    username: string
    profileImage: string
    status?: UserStatus
    location?: string
    bio?: string
    friendStatus?: FriendStatus
  }
  
  export interface Friend {
    id: string
    user: People
    target: People
    status: FriendStatus
  }