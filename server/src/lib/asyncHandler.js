/** Lets an async Express handler's rejections reach the error middleware instead of crashing the process. */
export function asyncHandler(handler) {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
