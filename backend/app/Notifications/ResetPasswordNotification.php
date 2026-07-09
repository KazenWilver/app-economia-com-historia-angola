<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
        public string $redirectPath = '/login',
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $resetUrl = $frontendUrl.'/redefinir-palavra-passe?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
            'redirect' => $this->redirectPath,
        ]);

        return (new MailMessage)
            ->subject('Recuperar palavra-passe — Jindungo')
            ->greeting('Olá '.$notifiable->name.'!')
            ->line('Recebemos um pedido para redefinir a tua palavra-passe na plataforma Jindungo.')
            ->action('Redefinir palavra-passe', $resetUrl)
            ->line('Este link expira em '.config('auth.passwords.users.expire').' minutos.')
            ->line('Se não fizeste este pedido, podes ignorar este email com segurança.');
    }
}
