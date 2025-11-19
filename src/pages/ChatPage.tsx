// Página de chat en tiempo real
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ChatMessage, ChatRoom, User } from '../types';
import { chatService } from '../services/chat';
import { usersService } from '../services/users';
import { formatTime, formatDate } from '../utils/formatters';
import { 
  Send, 
  MessageCircle, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialChatRoom?: string;
  initialUser?: User;
  requestId?: string;
}

export function ChatPage({ onNavigate, initialChatRoom, initialUser, requestId }: ChatPageProps) {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Record<string, User>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
    
    // Cleanup al desmontar el componente
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      
      // Configurar escucha en tiempo real
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      unsubscribeRef.current = chatService.onMessagesChanged(selectedRoom.id, (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
        
        // Marcar mensajes como leídos
        if (user) {
          chatService.markMessagesAsRead(selectedRoom.id, user.id);
        }
      });
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Crear o abrir chat si se pasa un usuario inicial
  useEffect(() => {
    console.log('🔍 ChatPage useEffect - initialUser:', initialUser);
    console.log('🔍 ChatPage useEffect - user:', user);
    console.log('🔍 ChatPage useEffect - selectedRoom:', selectedRoom);
    console.log('🔍 ChatPage useEffect - requestId:', requestId);
    console.log('🔍 ChatPage useEffect - chatRooms.length:', chatRooms.length);
    console.log('🔍 ChatPage useEffect - users keys:', Object.keys(users));
    
    if (initialUser && user && !selectedRoom) {
      console.log('🚀 Creando/abriendo chat con:', initialUser.name);
      console.log('🔧 Datos del initialUser:', {
        id: initialUser.id,
        name: initialUser.name,
        email: initialUser.email,
        currentMode: initialUser.currentMode,
        isTutor: initialUser.isTutor,
        subjects: initialUser.subjects,
        hourlyRate: initialUser.hourlyRate,
        rating: initialUser.rating,
        location: initialUser.location,
        availability: initialUser.availability,
        avatar: initialUser.avatar
      });
      console.log('🔧 Usuario actual:', {
        id: user.id,
        name: user.name,
        email: user.email,
        currentMode: user.currentMode
      });
      console.log('🔧 Estado actual de chatRooms:', chatRooms.map(r => ({ id: r.id, participants: r.participants })));
      createOrOpenChat(initialUser);
    } else {
      console.log('❌ Condiciones del useEffect NO se cumplen:');
      console.log('   • initialUser:', !!initialUser);
      console.log('   • user:', !!user);
      console.log('   • selectedRoom:', !!selectedRoom);
      if (initialUser) {
        console.log('   • initialUser.id:', initialUser.id);
        console.log('   • initialUser.name:', initialUser.name);
      }
      if (user) {
        console.log('   • user.id:', user.id);
        console.log('   • user.name:', user.name);
      }
      if (selectedRoom) {
        console.log('   • selectedRoom.id:', selectedRoom.id);
        console.log('   • selectedRoom.participants:', selectedRoom.participants);
      }
    }
  }, [initialUser, user, selectedRoom]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(''); // Limpiar errores anteriores
      console.log('🔧 Cargando conversaciones para usuario:', user.id);
      
      const rooms = await chatService.getUserChatRooms(user.id);
      console.log('📚 Conversaciones encontradas:', rooms.length);
      
      setChatRooms(rooms);
      
      // Cargar información de usuarios de todas las salas
      if (rooms.length > 0) {
        console.log('🔧 Cargando información de usuarios...');
        await loadUsersFromRooms(rooms);
        
        // Verificar que todos los usuarios se cargaron correctamente
        setTimeout(() => {
          const missingUsers = [];
          rooms.forEach(room => {
            const otherUserId = room.participants.find(id => id !== user.id);
            if (otherUserId && !users[otherUserId]) {
              missingUsers.push(otherUserId);
            }
          });
          
          if (missingUsers.length > 0) {
            console.log('⚠️ Algunos usuarios no se cargaron, reintentando...', missingUsers);
            loadUsersFromRooms(rooms);
          } else {
            console.log('✅ Todos los usuarios cargados correctamente');
          }
        }, 1000);
      } else {
        console.log('ℹ️ No hay conversaciones disponibles');
      }
    } catch (err) {
      console.error('❌ Error al cargar las conversaciones:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromRooms = async (rooms: ChatRoom[]) => {
    try {
      console.log('🔧 Cargando usuarios de las salas...');
      const userIds = new Set<string>();
      rooms.forEach(room => {
        room.participants.forEach(participantId => {
          if (participantId !== user?.id) {
            userIds.add(participantId);
          }
        });
      });

      console.log('👥 IDs de usuarios a cargar:', Array.from(userIds));

      if (userIds.size > 0) {
        const usersData = await usersService.getUsersByIds(Array.from(userIds));
        console.log('✅ Usuarios cargados:', Object.keys(usersData));
        
        // Combinar con usuarios existentes en lugar de reemplazar
        setUsers(prevUsers => ({
          ...prevUsers,
          ...usersData
        }));
      } else {
        console.log('ℹ️ No hay usuarios que cargar');
      }
    } catch (err) {
      console.error('❌ Error loading users from rooms:', err);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const messages = await chatService.getMessages(roomId);
      setMessages(messages);
      
      // Marcar mensajes como leídos
      if (user) {
        await chatService.markMessagesAsRead(roomId, user.id);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const createOrOpenChat = async (otherUser: User) => {
    console.log('🔧 createOrOpenChat iniciado con:', otherUser.name);
    console.log('🔧 Usuario actual:', user?.id);
    console.log('🔧 Otro usuario:', otherUser.id);
    console.log('🔧 Datos completos del otro usuario:', otherUser);
    console.log('🔧 requestId:', requestId);
    
    if (!user) {
      console.log('❌ No hay usuario autenticado');
      setError('No hay usuario autenticado');
      return;
    }

    // Verificar que no sea el mismo usuario
    if (user.id === otherUser.id) {
      console.log('❌ No puedes chatear contigo mismo');
      setError('No puedes chatear contigo mismo');
      return;
    }

    try {
      setError(''); // Limpiar errores anteriores
      console.log('🔧 Creando/obteniendo sala de chat...');
      console.log('🔧 Parámetros para getOrCreateChatRoom:');
      console.log('   • user1Id:', user.id);
      console.log('   • user2Id:', otherUser.id);
      console.log('   • requestId:', requestId);
      
      const roomId = await chatService.getOrCreateChatRoom(user.id, otherUser.id, requestId);
      console.log('✅ Sala de chat creada/obtenida:', roomId);
      
      // Crear objeto ChatRoom
      const room: ChatRoom = {
        id: roomId,
        participants: [user.id, otherUser.id],
        updatedAt: new Date(),
        requestId,
      };
      
      console.log('🔧 Configurando sala seleccionada:', room);
      setSelectedRoom(room);
      setUsers(prev => {
        const newUsers = { ...prev, [otherUser.id]: otherUser };
        console.log('🔧 Usuarios actualizados:', Object.keys(newUsers));
        return newUsers;
      });
      
      // Actualizar lista de salas si es nueva
      const existingRoom = chatRooms.find(r => r.id === room.id);
      if (!existingRoom) {
        console.log('🔧 Agregando nueva sala a la lista');
        setChatRooms(prev => {
          const newRooms = [room, ...prev];
          console.log('🔧 Salas actualizadas:', newRooms.length);
          return newRooms;
        });
      } else {
        console.log('🔧 Sala ya existe en la lista');
      }

      // Recargar la lista de conversaciones para asegurar que aparezca
      console.log('🔧 Recargando lista de conversaciones...');
      await loadChatRooms();

      // Si hay requestId, crear mensajes de demostración
      if (requestId) {
        console.log('🔧 Creando mensajes de demostración...');
        await chatService.createDemoMessages(user.id, otherUser.id, requestId);
      }

      console.log('✅ Chat creado/abierto exitosamente');
      console.log('🔧 Estado final - chatRooms:', chatRooms.length);
      console.log('🔧 Estado final - users:', Object.keys(users));
    } catch (err) {
      console.error('❌ Error al abrir la conversación:', err);
      setError('Error al abrir la conversación');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user || sending) return;

    try {
      setSending(true);
      
      const otherUserId = selectedRoom.participants.find(id => id !== user.id);
      if (!otherUserId) return;

      await chatService.sendMessage(
        selectedRoom.id,
        user.id,
        otherUserId,
        newMessage.trim(),
        selectedRoom.requestId
      );

      setNewMessage('');
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (room: ChatRoom): User | null => {
    if (!user) return null;
    const otherUserId = room.participants.find(id => id !== user.id);
    if (!otherUserId) return null;
    
    const otherUser = users[otherUserId];
    if (!otherUser) {
      console.log('⚠️ Usuario no encontrado en cache:', otherUserId);
      console.log('📚 Usuarios disponibles:', Object.keys(users));
      console.log('🔧 Recargando usuarios para esta sala...');
      
      // Intentar cargar el usuario específico
      loadUsersFromRooms([room]).then(() => {
        console.log('✅ Usuarios recargados para la sala:', room.id);
      }).catch(err => {
        console.error('❌ Error recargando usuarios:', err);
      });
      
      return null;
    }
    
    return otherUser;
  };

  const getUnreadCount = (room: ChatRoom): number => {
    return messages.filter(
      m => m.receiverId === user?.id && !m.read && room.participants.includes(m.senderId)
    ).length;
  };

  return (
    <div className="container-mobile page-layout w-full max-w-full overflow-x-hidden">
      <div className="h-[calc(100vh-6rem)] flex bg-white rounded-lg shadow-sm">
        {/* Sidebar - Lista de conversaciones */}
        <div className={`${selectedRoom ? 'hidden md:block' : 'block'} w-full md:w-80 border-r flex flex-col`}>
          <div className="p-4 border-b">
            <h2 className="text-lg mb-3">Conversaciones</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="size-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="mb-2">No hay conversaciones</h3>
                <p className="text-sm text-gray-600">
                  Las conversaciones aparecerán aquí cuando contactes a un tutor o estudiante
                </p>
              </div>
            ) : (
              <div className="p-2">
                {chatRooms.map((room) => {
                  const otherUser = getOtherUser(room);
                  if (!otherUser) return null;

                  const unreadCount = getUnreadCount(room);

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200 border' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={otherUser.avatar} />
                            <AvatarFallback>
                              {otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{otherUser.name}</p>
                            {room.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(room.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {room.lastMessage?.content || 'Iniciar conversación'}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedRoom ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedRoom(null)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  
                  {(() => {
                    const otherUser = getOtherUser(selectedRoom);
                    if (!otherUser) return null;
                    
                    return (
                      <>
                        <Avatar>
                          <AvatarImage src={otherUser.avatar} />
                          <AvatarFallback>
                            {otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{otherUser.name}</h3>
                          <p className="text-sm text-green-600">En línea</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert('Función de llamada de voz próximamente')}
                  >
                    <Phone className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert('Función de videollamada próximamente')}
                  >
                    <Video className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="size-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg mb-2">¡Empieza la conversación!</h3>
                    <p className="text-gray-600">
                      Envía tu primer mensaje para comenzar a chatear
                    </p>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isMe = message.senderId === user?.id;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMe 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isMe ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                            {isMe && (
                              message.read ? (
                                <CheckCheck className="size-3" />
                              ) : (
                                <Check className="size-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // En una implementación real, aquí subirías el archivo
                        alert(`Archivo seleccionado: ${file.name}\n\nEn una implementación real, este archivo se subiría y compartiría en el chat.`);
                        e.target.value = ''; // Limpiar el input
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    title="Compartir archivo"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={sending}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      title="Agregar emoji"
                    >
                      <Smile className="size-4" />
                    </Button>
                  </div>

                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !newMessage.trim()}
                    size="sm"
                    title="Enviar mensaje"
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Puedes compartir archivos PDF, documentos e imágenes (máx. 10MB)
                </div>
              </div>
            </>
          ) : (
            // No chat selected
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageCircle className="size-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}