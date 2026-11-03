<?php

namespace App\Mail;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProposalRevisionSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $proposal;
    public $sender;
    public $notes;

    public function __construct(Proposal $proposal, User $sender, $notes = null)
    {
        $this->proposal = $proposal;
        $this->sender = $sender;
        $this->notes = $notes;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            replyTo: [
                new Address(config('mail.from.address'), config('mail.from.name'))
            ],
            subject: '📤 [Projecity] Revisi Proposal Diunggah: ' . $this->proposal->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.proposals.revision_submitted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
