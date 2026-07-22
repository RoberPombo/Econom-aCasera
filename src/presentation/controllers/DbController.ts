import type { AppContainer } from "../../application/AppContainer";

export class DbController {
  constructor(private readonly container: AppContainer) {}

  info(): Response {
    const info = this.container.getDbInfo();
    return Response.json(info);
  }

  reload(): Response {
    const result = this.container.reloadDatabase();
    return Response.json({ ok: true, ...result });
  }

  forceOverwrite(): Response {
    const result = this.container.forceOverwrite();
    return Response.json({ ok: true, ...result });
  }
}
