use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface, MintTo, mint_to},
};

declare_id!("9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd");

#[program]
pub mod gaia_recs {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", _ctx.program_id);
        Ok(())
    }

    pub fn add_device(
        ctx: Context<AddDevice>,
        name: String,
        serial_number: String,
        device_brand: String,
        location: String,
        capacity_kw: u32,
    ) -> Result<()> {
        let device = &mut ctx.accounts.device;
        device.name = name;
        device.owner = ctx.accounts.owner.key();
        device.serial_number = serial_number;
        device.device_brand = device_brand;
        device.location = location;
        device.capacity_kw = capacity_kw;
        device.bump = ctx.bumps.device;
        
        msg!("Device {} added successfully by {}", device.name, device.owner);
        Ok(())
    }

    pub fn mint_energy(ctx: Context<MintEnergy>, amount: u64) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        mint_to(cpi_ctx, amount)?;

        msg!("Minted {} kW to {}", amount, ctx.accounts.destination.key());
        Ok(())
    }

    pub fn mint_recs(
        ctx: Context<MintRECs>,
        certificate_id: String,
        rec_amount: u64,
        generation_date: i64,
        expiry_date: i64,
    ) -> Result<()> {
        // Mint the Token-2022 tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        mint_to(cpi_ctx, rec_amount)?;

        // Initialize the RECertificate PDA
        let certificate = &mut ctx.accounts.certificate;
        certificate.owner = ctx.accounts.owner.key();
        certificate.certificate_id = certificate_id;
        certificate.device = ctx.accounts.device.key();
        certificate.energy_report = Pubkey::default(); // Optional logic could be handled differently
        certificate.rec_amount = rec_amount;
        certificate.generation_date = generation_date;
        certificate.expiry_date = expiry_date;
        certificate.is_retired = false;
        certificate.retirement_reason = String::from("");
        certificate.retirement_date = 0;
        certificate.token_account = ctx.accounts.destination.key();
        certificate.bump = ctx.bumps.certificate;

        msg!("Minted {} RECs to {} with cert ID: {}", rec_amount, ctx.accounts.destination.key(), certificate.certificate_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(name: String, serial_number: String)]
pub struct AddDevice<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 512, // 8 discriminator + padding max config
        seeds = [b"device", owner.key().as_ref(), serial_number.as_bytes()],
        bump
    )]
    pub device: Account<'info, Device>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintEnergy<'info> {
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(certificate_id: String)]
pub struct MintRECs<'info> {
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    pub device: Account<'info, Device>,

    #[account(
        init,
        payer = owner,
        space = 8 + 512, // 8 discriminator + padding
        seeds = [b"certificate", mint.key().as_ref(), certificate_id.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, RECertificate>,
    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Device {
    pub name: String,
    pub owner: Pubkey,
    pub serial_number: String,
    pub device_brand: String,
    pub location: String,
    pub capacity_kw: u32,
    pub bump: u8,
}

#[account]
pub struct RECertificate {
    // Identificación
    pub owner: Pubkey,           // Dueño actual del certificado
    pub certificate_id: String,  // ID único del certificado (máx 50 chars)
    
    // Referencias
    pub device: Pubkey,          // Dispositivo que generó la energía
    pub energy_report: Pubkey,   // Reporte de energía asociado (opcional)
    
    // Datos del certificado
    pub rec_amount: u64,         // Cantidad de RECs en este certificado
    pub generation_date: i64,    // Fecha de generación (timestamp Unix)
    pub expiry_date: i64,        // Fecha de expiración (timestamp Unix)
    
    // Estado
    pub is_retired: bool,        // Retirado/consumido
    pub retirement_reason: String, // Razón de retiro (máx 100 chars)
    pub retirement_date: i64,    // Fecha de retiro (timestamp Unix)
    
    // Referencia a token (Token-2022)
    pub token_account: Pubkey,   // Cuenta de token asociada
    
    // PDA bump
    pub bump: u8,
}
