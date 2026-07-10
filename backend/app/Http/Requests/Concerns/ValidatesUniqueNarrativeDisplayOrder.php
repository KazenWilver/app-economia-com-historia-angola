<?php

namespace App\Http\Requests\Concerns;

use App\Models\MapNarrative;
use Illuminate\Validation\Validator;

trait ValidatesUniqueNarrativeDisplayOrder
{
    protected function validateUniqueDisplayOrder(Validator $validator): void
    {
        $provinceId = $this->input('province_id');
        $displayOrder = $this->input('display_order');

        if ($provinceId === null || $displayOrder === null || $displayOrder === '') {
            return;
        }

        $query = MapNarrative::query()
            ->where('province_id', (int) $provinceId)
            ->where('display_order', (int) $displayOrder);

        /** @var MapNarrative|null $current */
        $current = $this->route('mapNarrative');

        if ($current instanceof MapNarrative) {
            $query->where('id', '!=', $current->id);

            if ($this->missing('province_id')) {
                $query->where('province_id', $current->province_id);
            }
        }

        if ($query->exists()) {
            $validator->errors()->add(
                'display_order',
                'Já existe uma narrativa desta província com esta ordem de exibição.'
            );
        }
    }
}
