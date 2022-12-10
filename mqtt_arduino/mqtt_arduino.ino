#include <ESP8266WiFi.h> //connect wifi
#include <PubSubClient.h> //connect mqtt
#include <DHT.h> //connect dht11
#include <WiFiUdp.h> //get local time
#include <NTPClient.h> //get local time
#include <ArduinoJson.h> //convert to json

//DHT config
#define DHTPIN D2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Insert your network credentials
const char* ssid = "Iphone cua Bao";
const char* password = "05092001";
const char* mqtt_server = "172.20.10.4";
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

// Function that gets current local time
unsigned long getTime() {
  timeClient.update();
  unsigned long now = timeClient.getEpochTime();
  return now;
}

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  timeClient.begin();
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // Switch on the LED if an 1 was received as first character
  if ((char)payload[0] == '1') {
    digitalWrite(BUILTIN_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level
    // but actually the LED is on; this is because
    // it is active low on the ESP-01)
  } else {
    digitalWrite(BUILTIN_LED, HIGH);  // Turn the LED off by making the voltage HIGH
  }

}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "esp8266-sensor-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    WiFi.mode(WIFI_STA);
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, send first data to server
      sendData();      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883); //connect to mqtt server
  client.setCallback(callback);
}

void sendData() {
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int timestamp = getTime();
  if (isnan(temp) || isnan(humi)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  //Create json data
  StaticJsonBuffer<300> JSONbuffer;
  JsonObject& JSONData = JSONbuffer.createObject();    
  JSONData["Temp"] = temp;
  JSONData["Humi"] = humi;
  JSONData["Ts"] = timestamp;

  char JSONmessageBuffer[100];
  JSONData.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
  Serial.println(JSONmessageBuffer);
  
  //Publish data to topic sensor/update
  client.publish("sensor/update", JSONmessageBuffer);
}

void loop() {
  //Check connect to mqtt server
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  
  if (now - lastMsg > 5000) {
    lastMsg = now;
    //Send data to server
    sendData();
  }
}
