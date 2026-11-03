<?php

namespace App\Mail;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProposalVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $proposal;

    public function __construct(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            replyTo: [
                new Address(config('mail.from.address'), config('mail.from.name'))
            ],
            subject: '✅ [Projecity] Proposal Terverifikasi: ' . $this->proposal->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.proposals.verified',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
