# @dusman/ui

Shared UI component library for the Düşmanı Tanı Ablukayı Dağıt platform. All components follow the design system specifications and use Tailwind CSS with custom design tokens.

## Installation

Components are available within the monorepo. Import directly from the package:

```tsx
import { Button, Card, Input, Modal } from '@dusman/ui';
```

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@dusman/ui';

export default function Example() {
  return (
    <>
      <Button variant="primary">Primary Action</Button>
      <Button variant="secondary">Secondary Action</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="tertiary">Link-like Button</Button>
      
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      
      <Button fullWidth>Full Width</Button>
      <Button isLoading>Loading...</Button>
    </>
  );
}
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'tertiary' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `disabled`: boolean
- Standard HTML button attributes

### Card

Container component for content with consistent styling.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@dusman/ui';
import { Button } from '@dusman/ui';

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Optional description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

**Props:**
- `hoverable`: boolean (default: false) - Adds hover shadow effect
- `noBorder`: boolean (default: false) - Removes border

### Input

Text input with label, error handling, and helper text.

```tsx
import { Input } from '@dusman/ui';

export default function Example() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <Input
      label="Email Address"
      type="email"
      placeholder="user@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={error}
      helperText="We'll never share your email"
      required
    />
  );
}
```

**Props:**
- `label`: string - Label text
- `error`: string - Error message
- `helperText`: string - Helper text
- `fullWidth`: boolean (default: true)
- Standard HTML input attributes

### Textarea

Multi-line text input with optional character count.

```tsx
import { Textarea } from '@dusman/ui';

export default function Example() {
  const [description, setDescription] = useState('');

  return (
    <Textarea
      label="Description"
      placeholder="Enter a detailed description..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      showCharacterCount
      maxCharacters={500}
      helperText="Provide detailed information"
    />
  );
}
```

**Props:**
- `label`: string - Label text
- `error`: string - Error message
- `helperText`: string - Helper text
- `fullWidth`: boolean (default: true)
- `showCharacterCount`: boolean (default: false)
- `maxCharacters`: number - Maximum character limit
- Standard HTML textarea attributes

### Select

Dropdown select input.

```tsx
import { Select } from '@dusman/ui';

export default function Example() {
  const [status, setStatus] = useState('');

  return (
    <Select
      label="Status"
      options={[
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ]}
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      placeholder="Select a status"
    />
  );
}
```

**Props:**
- `label`: string - Label text
- `options`: SelectOption[] - Array of { value, label, disabled? }
- `placeholder`: string - Placeholder text
- `error`: string - Error message
- `helperText`: string - Helper text
- `fullWidth`: boolean (default: true)
- Standard HTML select attributes

### Modal

Dialog component with backdrop and close button.

```tsx
import { Modal, Button } from '@dusman/ui';
import { useState } from 'react';

export default function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>Are you sure you want to proceed with this action?</p>
      </Modal>
    </>
  );
}
```

**Props:**
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Callback when modal should close
- `title`: string - Modal title
- `footer`: ReactNode - Footer content (usually buttons)
- `closeOnBackdropClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

### Form Components

Collection of components for building forms.

```tsx
import { Form, FormGroup, FormRow, FormError, FormSuccess, FormActions, Button, Input } from '@dusman/ui';
import { useState } from 'react';

export default function Example() {
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  return (
    <Form onSubmit={handleSubmit}>
      <FormError messages={formErrors} />
      <FormSuccess message={success} />
      
      <FormRow columns={2}>
        <Input label="First Name" required />
        <Input label="Last Name" required />
      </FormRow>
      
      <FormGroup>
        <Input label="Email" type="email" required />
      </FormGroup>
      
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Submit</Button>
      </FormActions>
    </Form>
  );
}
```

**Components:**
- `Form` - Wrapper with vertical spacing
- `FormGroup` - Groups a label + input
- `FormRow` - Multi-column grid (2, 3, or 4 columns)
- `FormError` - Error message display
- `FormSuccess` - Success message display
- `FormActions` - Button group for form actions (align: 'start' | 'center' | 'end')

## Design System Integration

All components use Tailwind CSS classes directly and rely on the design tokens defined in `tailwind.config.ts`:

### Colors
- **Primary**: Red (red-600: #dc2626)
- **Text**: Slate-900 (#1a1a1a), Slate-600, Slate-400
- **Borders**: Slate-200 (#e5e5e5)
- **Success**: Emerald-600 (#059669)
- **Error**: Rose-600 (#e11d48)
- **Warning**: Amber-600 (#d97706)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px

### Typography
- h1, h2, h3, h4: Heading styles
- body-lg, body, body-sm: Body text
- caption, tiny: Small text

### Shadows & Radius
- Shadow: xs, sm, base, md, lg, xl
- Border radius: xs, sm, base, md, lg, xl

## Accessibility

All components include:
- Proper semantic HTML
- ARIA labels and roles
- Focus states (ring-2 focus:ring-red-600)
- Keyboard navigation support
- Error announcements
- Disabled state handling

## Contributing

When adding new components:
1. Follow the design system guidelines
2. Use Tailwind CSS classes (no inline styles)
3. Support `forwardRef` for component composition
4. Include proper TypeScript types
5. Add examples in README
6. Ensure accessibility (ARIA, keyboard support)
7. Test with dark mode compatibility in mind

---

**Design System Reference**: See [DESIGN_SYSTEM.md](../../packages/design-system/DESIGN_SYSTEM.md)
