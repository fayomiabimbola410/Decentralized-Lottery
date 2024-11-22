import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Clarity contract state
let lotteryId = 0;
let ticketPrice = 1000000; // 1 STX
let lotteryBalance = 0;
let lotteryInProgress = false;
let lotteryEndBlock = 0;
let winner = 'SP000000000000000000002Q6VF78';
let totalTickets = 0;
let tickets = new Map<number, { owner: string }>();
let blockHeight = 0;

// Mock Clarity functions
function startLottery(caller: string, duration: number): { type: string; value: number } {
  if (caller !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
    return { type: 'err', value: 100 }; // err-owner-only
  }
  if (lotteryInProgress) {
    return { type: 'err', value: 102 }; // err-lottery-in-progress
  }
  lotteryId++;
  lotteryInProgress = true;
  lotteryEndBlock = blockHeight + duration;
  lotteryBalance = 0;
  totalTickets = 0;
  tickets.clear();
  return { type: 'ok', value: lotteryId };
}

function buyTicket(caller: string): { type: string; value: number } {
  if (!lotteryInProgress) {
    return { type: 'err', value: 103 }; // err-lottery-not-in-progress
  }
  if (ticketPrice > 1000000000) { // Assume each user has 1000 STX
    return { type: 'err', value: 104 }; // err-insufficient-funds
  }
  totalTickets++;
  lotteryBalance += ticketPrice;
  tickets.set(totalTickets, { owner: caller });
  return { type: 'ok', value: totalTickets };
}

function endLottery(caller: string): { type: string; value: number } {
  if (caller !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
    return { type: 'err', value: 100 }; // err-owner-only
  }
  if (!lotteryInProgress) {
    return { type: 'err', value: 103 }; // err-lottery-not-in-progress
  }
  if (blockHeight < lotteryEndBlock) {
    return { type: 'err', value: 102 }; // err-lottery-in-progress
  }
  const winningNumber = blockHeight % totalTickets;
  const winnerData = tickets.get(winningNumber + 1);
  if (!winnerData) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  lotteryInProgress = false;
  winner = winnerData.owner;
  const prizeAmount = lotteryBalance;
  lotteryBalance = 0;
  return { type: 'ok', value: prizeAmount };
}

function getTicketPrice(): { type: string; value: number } {
  return { type: 'ok', value: ticketPrice };
}

function getTicketOwner(ticketNumber: number): { type: string; value: any } {
  return { type: 'ok', value: tickets.get(ticketNumber) };
}

function getLotteryBalance(): { type: string; value: number } {
  return { type: 'ok', value: lotteryBalance };
}

function getLotteryStatus(): { type: string; value: any } {
  return { type: 'ok', value: {
      inProgress: lotteryInProgress,
      endBlock: lotteryEndBlock,
      currentBlock: blockHeight,
      totalTickets: totalTickets
    }};
}

function getWinner(): { type: string; value: string } {
  return { type: 'ok', value: winner };
}

describe('Decentralized Lottery', () => {
  beforeEach(() => {
    lotteryId = 0;
    ticketPrice = 1000000;
    lotteryBalance = 0;
    lotteryInProgress = false;
    lotteryEndBlock = 0;
    winner = 'SP000000000000000000002Q6VF78';
    totalTickets = 0;
    tickets.clear();
    blockHeight = 0;
  });
  
  it('should start a new lottery', () => {
    const result = startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    expect(lotteryInProgress).toBe(true);
    expect(lotteryEndBlock).toBe(100);
  });
  
  it('should not allow non-owner to start a lottery', () => {
    const result = startLottery('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', 100);
    expect(result.type).toBe('err');
    expect(result.value).toBe(100); // err-owner-only
  });
  
  it('should allow users to buy tickets', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    const result = buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    expect(lotteryBalance).toBe(1000000);
    expect(totalTickets).toBe(1);
  });
  
  it('should not allow buying tickets when lottery is not in progress', () => {
    const result = buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    expect(result.type).toBe('err');
    expect(result.value).toBe(103); // err-lottery-not-in-progress
  });
  
  it('should end the lottery and distribute prize', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    buyTicket('ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0');
    blockHeight = 101;
    const result = endLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(2000000);
    expect(lotteryInProgress).toBe(false);
    expect(lotteryBalance).toBe(0);
    expect(winner).not.toBe('SP000000000000000000002Q6VF78');
  });
  
  it('should not end the lottery before end block', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    blockHeight = 50;
    const result = endLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result.type).toBe('err');
    expect(result.value).toBe(102); // err-lottery-in-progress
  });
  
  it('should return correct lottery status', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    blockHeight = 50;
    const result = getLotteryStatus();
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({
      inProgress: true,
      endBlock: 100,
      currentBlock: 50,
      totalTickets: 1
    });
  });
  
  it('should return correct ticket owner', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    const result = getTicketOwner(1);
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({ owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' });
  });
  
  it('should return correct lottery balance', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    buyTicket('ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0');
    const result = getLotteryBalance();
    expect(result.type).toBe('ok');
    expect(result.value).toBe(2000000);
  });
  
  it('should return correct ticket price', () => {
    const result = getTicketPrice();
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1000000);
  });
  
  it('should return correct winner after lottery ends', () => {
    startLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 100);
    buyTicket('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    buyTicket('ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0');
    blockHeight = 101;
    endLottery('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const result = getWinner();
    expect(result.type).toBe('ok');
    expect(result.value).not.toBe('SP000000000000000000002Q6VF78');
    expect(['ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0']).toContain(result.value);
  });
});

