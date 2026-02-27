// Augment fabric types to include custom properties
import 'fabric/fabric-impl';

declare module 'fabric/fabric-impl' {
  interface Object {
    id?: string;
    name?: string;
    linkedVariable?: string;
  }
}
