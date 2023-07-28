'use client'
import axios from 'axios'
import { useState } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { ChatCompletionRequestMessage } from 'openai'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { BrainCircuit, User, MessagesSquare } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  message: z.string().min(10, {
    message: 'O mínimo de caracteres na pergunta é de 10 para ser enviada.'
  })
})
export default function Home() {
  const [openChat, setOpenChat] = useState(false)
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const message: ChatCompletionRequestMessage = {
      role: 'user',
      content: values.message
    }

    const massagesInContext = [...messages, message]

    try {
      const response = await axios.post('/api/ai/conversation', {
        messages: massagesInContext
      })
      setMessages(current => [...current, message, response.data])
      toast({
        variant: 'default',
        title: '...Obaaa',
        description: 'Mensagem enviada com sucesso'
      })
    } catch (error) {
      console.log('OPEN_AI_ERROR:', error)
      toast({
        variant: 'destructive',
        title: '...Opss',
        description: 'Não foi possível enviar a mensagem.'
      })
    }

    setIsLoading(false)
    form.reset()
  }

  return (
    <div className="container mt-4 pt-4 h-full ">
      <Modal
        isOpen={openChat}
        onRequestClose={() => setOpenChat(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="container mt-4 pt-4 h-full ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ask for Advice</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Faça sua pergunta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Inform the message.</FormDescription>
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full md:w-56"
                      disabled={isLoading}
                    >
                      Enviar
                    </Button>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className="flex flex-col mt-4 space-y-2">
            <div className="flex items-center justify-center">
              {isLoading && (
                <BrainCircuit className="container h-36 w-36 animate-pulse" />
              )}
            </div>
            <div className="container flex flex-col-reverse space-y-2">
              {messages.map(menssage => (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {menssage.role === 'assistant' && (
                        <BrainCircuit className="w-8 h-8" />
                      )}
                      {menssage.role === 'user' && <User className="w-8 h-8" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{menssage.content}</p>
                  </CardContent>
                  <CardFooter>
                    <p>{menssage.role}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Link href="" onClick={() => setOpenChat(true)}>
        <div className="flex justify-end">
          <div className="bg-secondary hover:bg-secondary/80 w-10 h-10 rounded-full flex justify-center items-center">
            <MessagesSquare />
          </div>
        </div>
      </Link>
    </div>
  )
}
