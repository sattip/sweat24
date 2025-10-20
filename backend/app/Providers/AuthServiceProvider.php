<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Policies\OwnsRecordPolicy;
use App\Models\BodyMeasurement;
use App\Models\ProgressPhoto;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        BodyMeasurement::class => OwnsRecordPolicy::class,
        ProgressPhoto::class => OwnsRecordPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

