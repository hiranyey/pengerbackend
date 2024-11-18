import { Room, Client, ClientArray } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  count = 0;
  onCreate(options: any) {
    this.setState(new MyRoomState());
    let count = 0;
    let scene = ["toolselect", "game"];
    let currentScene = 0;
    this.onMessage("*", (currenClient, type, message) => {
      if(type=="addObstacle" || type=="startGame"|| type =="end"){
        count++;
        if(count==this.clients.length){
          this.lock();
          this.broadcast("*", {
            message: scene[currentScene],
            type: "sceneChange"
          });
          count=0;
          currentScene = (currentScene+1)%scene.length;
        }
      }

      this.broadcast("*", {
        message: message,
        sender: currenClient.sessionId,
        type: type
      });
    });
  }

  cutePengerPrefixes = [
    "CheerfulPenger",
    "BubblyPenger",
    "SnugglyPenger",
    "PeppyPenger",
    "ZestyPenger",
    "PerkyPenger",
    "ChirpyPenger",
    "JollyPenger",
    "WittyPenger",
    "SunnyPenger"
  ];


  getNewName(): string {
    let newName = this.cutePengerPrefixes[Math.floor(Math.random() * this.cutePengerPrefixes.length)];
    let nameTaken = false;
    for (let key in this.state.players) {
      if (this.state.players[key].name === newName) {
        nameTaken = true;
        break;
      }
    }
    if (nameTaken) {
      return this.getNewName();
    }
    return newName;
  }
  getRandomRGBColorOfSameHSL(saturation: number, luminosity: number): { red: number, green: number, blue: number } {
    const hue = Math.floor(Math.random() * 360);

    const hslToRgb = (h: number, s: number, l: number) => {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    };

    const [red, green, blue] = hslToRgb(hue, saturation, luminosity);
    return { red, green, blue };
  }



  onJoin(client: Client, options: any) {
    let color = this.getRandomRGBColorOfSameHSL(100, 55);
    this.state.players[client.sessionId] = {
      sessionId: client.sessionId,
      name: this.getNewName(),
      red: color.red,
      green: color.green,
      blue: color.blue
    }
    this.broadcast("players", this.state.players)
  }

  onLeave(client: Client, consented: boolean) {
    delete this.state.players[client.sessionId]
    this.broadcast("players", this.state.players)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
