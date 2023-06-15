export const handleTokenExpire = (
  navigate,
  stateSetter,
  errorMsgSetBehavior = (prev, msg) => ({ ...prev, error: msg })
) => {
  /// Define the default behavior of the App when the token expires.
  /// navigate: Navigate hook.
  /// stateSetter: The state setter. This will set the state you have to an "error" state.
  /// errorMsgSetBehavior: Define how the function should set the state to an "error" state. By default,
  /// the function assume state is an Object with an 'error' key, which will then pass the error message into that key.
  /// However, if you have a custom state or a different key, you can define how to set that by passing a callback returning how you'd set it.
  const message = "Invalid session, redirecting to sign in page...";

  stateSetter((prev) => errorMsgSetBehavior(prev, message));
  setTimeout(navigate, 4000, "/sign-in");
};
