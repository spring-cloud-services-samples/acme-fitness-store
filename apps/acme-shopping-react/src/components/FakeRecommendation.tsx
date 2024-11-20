import Button from "./Button.tsx";

export default function FakeRecommendation({
  isExpanded,
}: {
  isExpanded: boolean;
}) {
  return (
    <div>
      <div
        className={`bg-navy-50 flex justify-between ${
          isExpanded ? "flex-row" : "flex-col"
        }`}
      >
        <div
          className={`flex object-contain bg-white items-center ${
            isExpanded ? "w-1/2" : "w-full"
          }`}
        >
          <img src="/bike.png" alt="Velocity V9" />
        </div>

        <div
          className={`flex flex-col justify-around ${
            isExpanded ? "w-1/2" : "w-full"
          }`}
        >
          <div className="flex flex-col my-4 ml-8 mr-24">
            <h2
              id="product-title"
              className={`text-grape mb-1  ${
                isExpanded ? "text-5xl mt-8" : "text-3xl mt-4"
              }`}
            >
              Velocity V9
            </h2>

            <h3
              className={`text-chocolate ${
                isExpanded ? "text-3xl my-2" : "text-2xl mb-2"
              }`}
            >
              $1,099.99
            </h3>

            <p>
              Velocity V9 is a high-performance hybrid bike that combines speed
              and comfort for riders who demand the best of both worlds.
            </p>

            <a href="/product/2fc78496-60fe-4322-8912-ebe6aa45971b">
              <Button
                data-cy="view-product-button"
                variant="filled"
                className="p-4 w-36 my-4"
              >
                Check it out
              </Button>
            </a>
          </div>

          <div className="text-med mx-4 md:mx-8">
            <div className="flex items-center gap-2">
              <svg
                className="size-6"
                width="19"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.16444 12.735C6.40944 12.908 6.70144 13 7.00044 12.999V12.995C7.2827 12.9955 7.55889 12.9131 7.79478 12.7581C8.03066 12.6031 8.21587 12.3823 8.32744 12.123L8.94044 10.259C9.08208 9.83678 9.31997 9.45328 9.63532 9.1388C9.95066 8.82432 10.3348 8.58749 10.7574 8.44701L12.5354 7.86901C12.8218 7.76839 13.0692 7.58 13.2424 7.33066C13.4155 7.08132 13.5056 6.78373 13.4999 6.48022C13.4941 6.17671 13.3928 5.88274 13.2103 5.64015C13.0278 5.39756 12.7735 5.2187 12.4834 5.12901L10.7284 4.55901C10.3039 4.41782 9.91809 4.17951 9.6018 3.86304C9.2855 3.54657 9.0474 3.16066 8.90644 2.73601L8.32844 0.959012C8.22764 0.675987 8.04118 0.431388 7.79498 0.259202C7.54877 0.087017 7.25505 -0.00420343 6.95462 -0.00178415C6.65419 0.000635134 6.36197 0.0965741 6.11857 0.272702C5.87517 0.44883 5.69267 0.6964 5.59644 0.981012L5.01344 2.77301C4.87286 3.18528 4.6405 3.56024 4.33389 3.86962C4.02728 4.179 3.65442 4.41472 3.24344 4.55901L1.46644 5.13001C1.18159 5.22892 0.934849 5.41452 0.76083 5.66077C0.586812 5.90702 0.494247 6.20157 0.496122 6.5031C0.497997 6.80463 0.594217 7.098 0.771285 7.34207C0.948353 7.58614 1.19738 7.76866 1.48344 7.86401L3.23744 8.43301C3.66192 8.57527 4.04751 8.8143 4.36372 9.1312C4.67994 9.44811 4.91812 9.83422 5.05944 10.259L5.63744 12.034C5.73644 12.317 5.92044 12.563 6.16444 12.735ZM13.8314 17.782C13.6409 17.6462 13.4976 17.4543 13.4214 17.233L13.0934 16.226C13.0303 16.0343 12.9232 15.86 12.7806 15.717C12.6381 15.5741 12.464 15.4666 12.2724 15.403L11.2814 15.08C11.0546 15.0035 10.8573 14.8579 10.7173 14.6637C10.5773 14.4695 10.5014 14.2364 10.5004 13.997C10.5006 13.7592 10.575 13.5273 10.7132 13.3337C10.8514 13.1401 11.0465 12.9944 11.2714 12.917L12.2774 12.591C12.4645 12.5246 12.6338 12.4163 12.7725 12.2743C12.9111 12.1324 13.0155 11.9605 13.0774 11.772L13.4014 10.78C13.4777 10.5558 13.6217 10.3608 13.8135 10.2219C14.0054 10.0831 14.2357 10.0072 14.4725 10.0049C14.7093 10.0026 14.941 10.0739 15.1356 10.209C15.3301 10.3441 15.4779 10.5363 15.5584 10.759L15.8874 11.773C15.9519 11.9631 16.0594 12.1357 16.2017 12.2772C16.3439 12.4188 16.517 12.5255 16.7074 12.589L17.6994 12.912C17.9281 12.9835 18.1285 13.1252 18.2721 13.317C18.4157 13.5088 18.4954 13.7409 18.4997 13.9804C18.504 14.22 18.4328 14.4548 18.2962 14.6517C18.1595 14.8485 17.9644 14.9973 17.7384 15.077L16.7244 15.406C16.5338 15.4704 16.3607 15.5781 16.2187 15.7207C16.0768 15.8634 15.9699 16.037 15.9064 16.228L15.5844 17.217C15.5064 17.447 15.3584 17.647 15.1594 17.787C14.9653 17.925 14.7328 17.9987 14.4946 17.9979C14.2565 17.997 14.0245 17.9215 13.8314 17.782Z"
                  fill="#5C0A90"
                />
              </svg>
              <h5 className="font-bold text text-chocolate">
                Why is the Velocity V9 a great fit for me?
              </h5>
            </div>

            <ul className="text-sm list-disc ml-8 m-4">
              <li className="my-1">
                Lightweight frame and 700c wheels with high-quality tires make
                it a great fit for paved roads and gravel alike.
              </li>
              <li className="my-1">
                Upright posture is ideal for a comfortable ride.
              </li>
              <li className="my-1">
                Tires and frame work well for a 170cm tall rider.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
