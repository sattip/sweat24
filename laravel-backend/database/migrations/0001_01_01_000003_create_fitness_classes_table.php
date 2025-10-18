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
        Schema::create('fitness_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('instructor_id')->constrained('trainers')->onDelete('cascade');
            $table->integer('duration'); // in minutes
            $table->integer('max_capacity');
            $table->string('location');
            $table->string('class_type');
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced']);
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->string('recurring_pattern')->nullable(); // daily, weekly, monthly
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fitness_classes');
    }
};