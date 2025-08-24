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
        Schema::create('workout_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('workout_session_id')->constrained()->onDelete('cascade');
            $table->boolean('attended')->default(true);
            $table->timestamp('completed_at');
            $table->integer('duration_minutes')->nullable();
            $table->integer('calories_burned')->nullable();
            $table->integer('rating')->nullable(); // 1-5 stars
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_histories');
    }
};