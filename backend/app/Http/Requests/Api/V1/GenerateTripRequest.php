<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTripRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'destination' => 'required|string|max:255',
            'days'        => 'required|integer|min:1|max:14',
            'budget'      => 'required|in:cheap,moderate,luxury',
            'travelers'   => 'required|in:solo,couple,family,friends',
        ];
    }
}
