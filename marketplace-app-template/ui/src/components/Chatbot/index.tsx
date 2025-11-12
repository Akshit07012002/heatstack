import React, { useState, useRef, useEffect } from 'react';
import { Button, Icon, TextInput } from '@contentstack/venus-components';
import './styles.scss';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot: React.FC = function () {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! How can I help you today?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Thank you for your message! I\'m here to help.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };

    useEffect(() => {
        const container = inputContainerRef.current;
        if (!container) {
            return undefined;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        };

        container.addEventListener('keydown', handleKeyDown, true);
        return () => {
            container.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [inputValue, handleSendMessage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="chatbot-container">
            <div
                ref={chatWindowRef}
                className={`chatbot-window ${isOpen ? 'open' : ''}`}
            >
                <div className="chatbot-header">
                    <div className="chatbot-header-content">
                        <Icon icon="MessageCircle" size="small" />
                        <span className="chatbot-title">Heatstack Chatbot</span>
                    </div>
                    <Button
                        buttonType="text"
                        iconOnly
                        icon="Close"
                        onClick={toggleChat}
                        className="chatbot-close-btn"
                    />
                </div>

                <div className="chatbot-messages" ref={messagesContainerRef}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`chatbot-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <div className="message-content">
                                <p>{message.text}</p>
                                <span className="message-time">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div
                    ref={inputContainerRef}
                    className="chatbot-input-container"
                    role="form"
                >
                    <TextInput
                        className="chatbot-input"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <Button
                        buttonType="primary"
                        iconOnly
                        icon="Send"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="chatbot-send-btn"
                    />
                </div>
            </div>

            <div className={`chatbot-toggle-wrapper ${isOpen ? 'hidden' : ''}`}>
                <Button
                    buttonType="primary"
                    iconOnly
                    icon="Chat"
                    iconProps={{
                        size: "large",
                        version: "v2",
                    }}
                    onClick={toggleChat}
                    className="chatbot-toggle-btn"
                    aria-label="Open chat"
                />
                {!isOpen && <span className="chatbot-badge">1</span>}
            </div>
        </div>
    );
};

export default Chatbot;

