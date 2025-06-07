<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('progress_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('photo_date');
            $table->string('photo_path');
            $table->enum('photo_type', ['front', 'side', 'back', 'other'])->default('front');
            $table->text('description')->nullable();
            $table->boolean('is_before')->default(false);
            $table->boolean('is_after')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'photo_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_photos');
    }
};