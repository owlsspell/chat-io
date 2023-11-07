import type { Socket } from "socket.io";

export interface ExtendedSocket extends Socket {
  username: string;
}
