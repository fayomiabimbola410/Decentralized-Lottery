;; Decentralized Lottery System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-lottery-in-progress (err u102))
(define-constant err-lottery-not-in-progress (err u103))
(define-constant err-insufficient-funds (err u104))

;; Data Variables
(define-data-var lottery-id uint u0)
(define-data-var ticket-price uint u1000000) ;; 1 STX
(define-data-var lottery-balance uint u0)
(define-data-var lottery-in-progress bool false)
(define-data-var lottery-end-block uint u0)
(define-data-var winner principal 'SP000000000000000000002Q6VF78)
(define-data-var total-tickets uint u0)

;; Data Maps
(define-map tickets
  { ticket-number: uint }
  { owner: principal }
)

;; Private Functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions
(define-public (start-lottery (duration uint))
  (begin
    (asserts! (is-owner) err-owner-only)
    (asserts! (not (var-get lottery-in-progress)) err-lottery-in-progress)
    (var-set lottery-id (+ (var-get lottery-id) u1))
    (var-set lottery-in-progress true)
    (var-set lottery-end-block (+ block-height duration))
    (var-set lottery-balance u0)
    (var-set total-tickets u0)
    (ok (var-get lottery-id))
  )
)

(define-public (buy-ticket)
  (let
    (
      (ticket-number (+ (var-get total-tickets) u1))
    )
    (asserts! (var-get lottery-in-progress) err-lottery-not-in-progress)
    (asserts! (>= (stx-get-balance tx-sender) (var-get ticket-price)) err-insufficient-funds)

    (try! (stx-transfer? (var-get ticket-price) tx-sender (as-contract tx-sender)))
    (var-set lottery-balance (+ (var-get lottery-balance) (var-get ticket-price)))
    (var-set total-tickets ticket-number)

    (map-set tickets
      { ticket-number: ticket-number }
      { owner: tx-sender }
    )
    (ok ticket-number)
  )
)

(define-public (end-lottery)
  (let
    (
      (winning-number (mod block-height (var-get total-tickets)))
      (winner-data (unwrap! (map-get? tickets { ticket-number: (+ winning-number u1) }) err-not-found))
      (prize-amount (var-get lottery-balance))
    )
    (asserts! (is-owner) err-owner-only)
    (asserts! (var-get lottery-in-progress) err-lottery-not-in-progress)
    (asserts! (>= block-height (var-get lottery-end-block)) err-lottery-in-progress)

    (var-set lottery-in-progress false)
    (var-set winner (get owner winner-data))
    (var-set lottery-balance u0)

    (try! (as-contract (stx-transfer? prize-amount tx-sender (var-get winner))))
    (ok prize-amount)
  )
)

;; Read-only Functions
(define-read-only (get-ticket-price)
  (ok (var-get ticket-price))
)

(define-read-only (get-ticket-owner (ticket-number uint))
  (ok (map-get? tickets { ticket-number: ticket-number }))
)

(define-read-only (get-lottery-balance)
  (ok (var-get lottery-balance))
)

(define-read-only (get-lottery-status)
  (ok {
    in-progress: (var-get lottery-in-progress),
    end-block: (var-get lottery-end-block),
    current-block: block-height,
    total-tickets: (var-get total-tickets)
  })
)

(define-read-only (get-winner)
  (ok (var-get winner))
)
