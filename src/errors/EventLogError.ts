export class EventLogError extends Error {
  public line: number;

  constructor(message: string, line: number) {
    super(`line ${line}: ${message}`); // Call the constructor of the parent class (Error)
    this.name = "EventLogError"; // Set the name of the error
    this.line = line;

    // Set the prototype explicitly for compatibility with certain environments
    Object.setPrototypeOf(this, EventLogError.prototype);
  }
}
