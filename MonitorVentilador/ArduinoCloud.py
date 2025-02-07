import serial
import requests
import time

# Configuración del puerto serial
arduino = serial.Serial('COM6', 9600, timeout=1)  # Cambia 'COM6' por el puerto correcto

# Configuración de ThingSpeak
THINGSPEAK_API_KEY = '2LINC331WG21APXH'  # Reemplaza con tu API Key
THINGSPEAK_URL = 'https://api.thingspeak.com/update'

def enviar_a_thingspeak(estado):
    """Enviar datos a ThingSpeak"""
    payload = {'api_key': THINGSPEAK_API_KEY, 'field1': estado}
    try:
        response = requests.get(THINGSPEAK_URL, params=payload)
        if response.status_code == 200:
            print(f'Dato enviado a ThingSpeak: {estado}')
        else:
            print(f'Error HTTP: {response.status_code}, {response.text}')
    except requests.exceptions.RequestException as e:
        print(f'Error al conectar con ThingSpeak: {e}')

ultimo_envio = time.time()  # Tiempo del último envío a ThingSpeak
ultimo_estado = None  # Estado anterior del motor

while True:
    try:
        # Leer datos del puerto serial
        if arduino.in_waiting > 0:
            linea = arduino.readline().decode('utf-8').strip()
            
            # Verifica que el dato sea un número válido (0 o 1)
            if linea.isdigit():
                estado_motor = int(linea)  # Convertir el estado del motor a entero
                
                # Imprimir constantemente el estado en la consola
                print(f"Estado actual del motor: {'Encendido' if estado_motor == 1 else 'Apagado'}")
                
                # Enviar datos a ThingSpeak cada 15 segundos
                if time.time() - ultimo_envio >= 15:
                    enviar_a_thingspeak(estado_motor)
                    ultimo_envio = time.time()  # Actualizar el tiempo del último envío
            
            time.sleep(0.05)  # Pausa breve para procesar los datos
    except KeyboardInterrupt:
        print("Programa terminado.")
        arduino.close()
        break
