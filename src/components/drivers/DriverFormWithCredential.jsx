import React, { useState } from 'react';
import DriverForm from './DriverForm';
import CredentialManager from './CredentialManager';

export default function DriverFormWithCredential({ driver, onSave, onCancel }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informações do Motorista</h3>
        <DriverForm driver={driver} onSave={onSave} onCancel={onCancel} />
      </div>

      {driver && driver.id && (
        <CredentialManager driver={driver} />
      )}
    </div>
  );
}