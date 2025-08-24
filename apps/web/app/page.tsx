'use client'

import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Später: API-Aufruf zum Backend
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Hallo! Ich bin Ihr KI-Assistent. Das Backend wird bald implementiert.',
        sender: 'ai',
        timestamp: new Date()
      }

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">KKI - KI Assistent</h1>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <h2 className="text-xl font-semibold mb-2">Willkommen bei KKI!</h2>
                <p>Stellen Sie mir eine Frage, um zu beginnen.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <p>Denke nach...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Schreiben Sie Ihre Nachricht..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Senden
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 KKI - Powered by Gemini AI</p>
        </div>
      </footer>
    </main>
  )
}
