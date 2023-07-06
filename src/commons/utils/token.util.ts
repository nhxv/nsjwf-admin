/**
 * Define the default behavior of the App when the token expires.
 * @param navigate The Navigate hook, responsible for redirecting.
 * @param stateSetter The state setter function.
 * @param paramCallback A function that accept a string/error message and return something. This something will be passed into `dispatch`.
 *    By default, this paramCallback will return an updater function used for `useState` hook because this is the most common scenario.
 *    Basically it returns this function: `(prev) => ({ ...prev, error: msg })`.
 */
export const handleTokenExpire = (
  navigate,
  stateSetter,
  // Have to typehint the return type so TS stops screaming.
  paramCallback: (msg: string) => any = function (msg: string) {
    return (prev) => ({ ...prev, error: msg });
  }
) => {
  const message = "Invalid session, redirecting to sign in page...";

  const param = paramCallback(message);
  stateSetter(param);
  setTimeout(navigate, 2000, "/sign-in");
};
