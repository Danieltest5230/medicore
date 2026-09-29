import json
import os
import sys
from pathlib import Path
import django

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

def run_smoke_test():
    c = Client()
    
    # 1. Health check
    res = c.get('/api/health/')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("Health check OK:", res.json())

    # 2. Login
    login_res = c.post(
        '/api/auth/login/',
        data=json.dumps({'email': 'medico@medicore.ar', 'password': 'AdminPassword123!'}),
        content_type='application/json'
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.status_code} - {login_res.content}"
    data = login_res.json()
    token = data['access']
    user = data['user']
    print(f"Login OK: {user['first_name']} {user['last_name']} ({user['role']})")

    auth_header = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    # 3. Patients
    pat_res = c.get('/api/patients/', **auth_header)
    assert pat_res.status_code == 200
    patients = pat_res.json().get('results', pat_res.json())
    print(f"Patients list OK: {len(patients)} patients found.")
    for p in patients:
        print(f" - {p['last_name']}, {p['first_name']} (DNI: {p['document_number']})")

    # 4. Appointments
    appt_res = c.get('/api/appointments/', **auth_header)
    assert appt_res.status_code == 200
    appts = appt_res.json().get('results', appt_res.json())
    print(f"Appointments list OK: {len(appts)} appointments scheduled.")

    # 5. Clinical Encounters
    enc_res = c.get('/api/clinical/encounters/', **auth_header)
    assert enc_res.status_code == 200
    encs = enc_res.json().get('results', enc_res.json())
    print(f"Clinical Encounters OK: {len(encs)} encounters.")
    if encs:
        e = encs[0]
        print(f" - Encounter {e['id']} | Status: {e['status']} | Hash: {e.get('signature_hash', '')[:16]}...")
        if e.get('vital_signs'):
            vs = e['vital_signs']
            print(f"   PA: {vs['systolic_bp']}/{vs['diastolic_bp']} mmHg, FC: {vs['heart_rate']} lpm")
        if e.get('anthropometry'):
            ant = e['anthropometry']
            print(f"   Peso: {ant['weight_kg']} kg, Talla: {ant['height_cm']} cm, IMC: {ant['bmi']} ({ant['nutritional_status']})")

    print("\nALL SMOKE TESTS PASSED SUCCESSFULLY! BACKEND IS OPERATIONAL.")

if __name__ == '__main__':
    run_smoke_test()
