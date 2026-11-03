<?php

namespace App\Events;

use App\Models\Proposal;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProposalUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $proposal;
    public $message;

    public function __construct(Proposal $proposal, $message)
    {
        $this->proposal = $proposal;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('proposals');
    }

    public function broadcastAs()
    {
        return 'proposal.updated';
    }
}
