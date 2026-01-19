import ora from "ora";

export class AppSpinner {
  private spinner;

  public get running() {
    return this.isRunning();
  }

  constructor(startingText: string = "", startNow: boolean = false) {
    this.spinner = ora({
      text: startingText,
      hideCursor: true,
      indent: 1,
    });
    if (startNow) this.start();
  }

  start() {
    this.spinner.start();
  }

  stop() {
    this.spinner.stop();
  }

  update(text: string) {
    this.spinner.text = text;
  }

  isRunning() {
    return this.spinner.isSpinning;
  }
}
