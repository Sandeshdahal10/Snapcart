import axios from 'axios'

/** Asks the socket server to push an event to one socket (socketId) or to everyone. */
async function emitEventHandler(event: string, data: any, socketId?: string) {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`,
      { socketId, event, data },
      { headers: { "x-socket-secret": process.env.SOCKET_SECRET || "" } },
    );
  } catch (error: any) {
    console.log("emitEventHandler error:", error?.message);
  }
}
export default emitEventHandler
