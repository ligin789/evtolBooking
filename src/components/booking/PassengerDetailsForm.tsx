import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Briefcase, Info } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { PassengerInput } from '../../services/types';
import { Button } from '../ui/Button';

const passengerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(40),
  lastName: z.string().trim().min(1, 'Last name is required').max(40),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  phone: z.union([z.literal(''), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number')]),
  weightKg: z.coerce.number({ invalid_type_error: 'Enter a weight in kg' }).min(20, 'Minimum 20 kg').max(160, 'Maximum 160 kg for this aircraft'),
  carryOn: z.boolean(),
});

const schema = z
  .object({ passengers: z.array(passengerSchema).min(1) })
  .superRefine((val, ctx) => {
    const lead = val.passengers[0];
    if (!lead.email) ctx.addIssue({ code: 'custom', path: ['passengers', 0, 'email'], message: 'Email is required for the lead passenger' });
    if (!lead.phone) ctx.addIssue({ code: 'custom', path: ['passengers', 0, 'phone'], message: 'Phone is required for the lead passenger' });
  });

type FormValues = z.infer<typeof schema>;

const blank = (): PassengerInput => ({ firstName: '', lastName: '', email: '', phone: '', weightKg: 75, carryOn: true });

interface Props {
  count: number;
  seats: (string | null)[];
  initial: PassengerInput[];
  onSubmit: (p: PassengerInput[]) => void;
}

export function PassengerDetailsForm({ count, seats, initial, onSubmit }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { passengers: Array.from({ length: count }, (_, i) => initial[i] ?? blank()) },
    mode: 'onTouched',
  });
  const { fields } = useFieldArray({ control, name: 'passengers' });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v.passengers))} noValidate className="space-y-4">
      {fields.map((field, i) => {
        const e = errors.passengers?.[i];
        return (
          <fieldset key={field.id} className="rounded-3xl border border-white/60 bg-paper/90 p-5 backdrop-blur-xl sm:p-6">
            <legend className="sr-only">Passenger {i + 1}</legend>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="eyebrow text-mist">{i === 0 ? 'Lead passenger' : `Passenger ${i + 1}`}</div>
                <div className="font-display mt-0.5 text-lg font-semibold">Seat {seats[i]}</div>
              </div>
              <span className="font-display grid h-10 w-12 place-items-center rounded-xl bg-electric-soft text-[15px] font-semibold text-electric">{seats[i]}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="First name" autoComplete={i === 0 ? 'given-name' : 'off'} error={e?.firstName?.message} {...register(`passengers.${i}.firstName`)} />
              <Input label="Last name" autoComplete={i === 0 ? 'family-name' : 'off'} error={e?.lastName?.message} {...register(`passengers.${i}.lastName`)} />
              <Input
                label={i === 0 ? 'Email' : 'Email (optional)'}
                type="email"
                inputMode="email"
                autoComplete={i === 0 ? 'email' : 'off'}
                error={e?.email?.message}
                {...register(`passengers.${i}.email`)}
              />
              <Input
                label={i === 0 ? 'Mobile' : 'Mobile (optional)'}
                type="tel"
                inputMode="tel"
                autoComplete={i === 0 ? 'tel' : 'off'}
                error={e?.phone?.message}
                {...register(`passengers.${i}.phone`)}
              />
              <Input
                label="Approx. body weight (kg)"
                type="number"
                inputMode="numeric"
                min={20}
                max={160}
                error={e?.weightKg?.message}
                hint="Used only for weight & balance"
                {...register(`passengers.${i}.weightKg`)}
              />
              <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-graphite/10 bg-white/70 px-4 py-3 text-[13px]">
                <input type="checkbox" className="h-4 w-4 accent-[#3d7bff]" {...register(`passengers.${i}.carryOn`)} />
                <Briefcase className="h-4 w-4 text-slate" aria-hidden="true" />
                <span>
                  Small carry-on <span className="text-mist">(max 7 kg, under-seat)</span>
                </span>
              </label>
            </div>
          </fieldset>
        );
      })}
      <p className="flex items-start gap-2 px-1 text-[12px] text-slate">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        eVTOL cabins are weight-sensitive; the pilot uses passenger and baggage weights to confirm the load before departure. Details stay in this browser tab only.
      </p>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>
          Review booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}


const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }>(function Input(
  { label, error, hint, className = '', ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-slate">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={`h-12 w-full rounded-2xl border bg-white/80 px-4 text-[15px] text-graphite transition outline-none placeholder:text-mist focus:border-electric focus:bg-white focus:ring-4 focus:ring-electric/15 ${
          error ? 'border-danger' : 'border-graphite/10'
        }`}
        {...rest}
      />
      {(error || hint) && (
        <p id={`${id}-msg`} className={`mt-1 text-[11.5px] ${error ? 'text-danger' : 'text-mist'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
