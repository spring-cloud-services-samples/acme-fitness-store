import UserIcon from "@mui/icons-material/AccountCircle";
import Button from "../components/Button";
import { useState } from "react";
import { useGetUserInfo } from "../hooks/userHooks";

export default function LoginButton() {
  const [open, setOpen] = useState(false);

  const { data: userInfo } = useGetUserInfo();

  if (userInfo?.userName == null) {
    return (
      <div id="login-button">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/acme-login")}
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="icon"
        id="logged-in-button"
        onClick={() => {
          setOpen(!open);
        }}
      >
        <UserIcon className="size-5" />
        <span className="sr-only">User account</span>
      </Button>

      {open ? (
        <div
          className="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 z-10 w-screen bg-black/50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="fill-blueberry"
                      >
                        <path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" />
                      </svg>
                    </div>

                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        className="text-base font-semibold leading-6 text-blueberry"
                        id="modal-title"
                      >
                        Account
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-blueberry">
                          Username: {userInfo?.userName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blueberry-50 px-4 py-3 flex flex-col gap-3 justify-center sm:flex-row sm:justify-end sm:px-6">
                  <Button
                    variant="outline"
                    className="border-blueberry text-blueberry hover:bg-blueberry-100"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>

                  <Button
                    variant="filled"
                    className="bg-blueberry-900"
                    onClick={() => {
                      window.location.href = "/scg-logout?redirect=/";
                    }}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
