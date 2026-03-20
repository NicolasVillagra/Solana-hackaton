use anchor_lang::prelude::*;

declare_id!("8UF83GAK1UZ3vS3wxuqa2bMEgJ2QfvUaS3EQsM5i5oaR");

#[program]
pub mod smartcontracts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
