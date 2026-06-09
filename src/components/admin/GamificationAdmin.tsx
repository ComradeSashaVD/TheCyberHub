'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function GamificationAdmin() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [xpAmount, setXpAmount] = useState(100);
  const [xpReason, setXpReason] = useState('');

  // Получение списка достижений
  const { data: achievements, refetch } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: async () => {
      const res = await fetchApi('/api/admin/achievements');
      return res.json();
    },
  });

  // Мутация для ручного начисления XP
  const awardXpMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      return fetchApi('/api/gamification/xp', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, source: 'admin_manual', description: reason }),
      });
    },
    onSuccess: () => {
      toast.success('XP awarded successfully');
      setSelectedUserId('');
      setXpAmount(100);
      setXpReason('');
    },
    onError: (error) => toast.error('Failed to award XP'),
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Manual XP Award</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>User ID</Label>
              <Input
                placeholder="User ID"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              />
            </div>
            <div>
              <Label>XP Amount</Label>
              <Input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                placeholder="Reason"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() => awardXpMutation.mutate({ userId: selectedUserId, amount: xpAmount, reason: xpReason })}
            disabled={!selectedUserId}
          >
            Award XP
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Achievements Management</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create New Achievement</Button>
            </DialogTrigger>
            <DialogContent>
              <AchievementForm onSubmit={(data) => console.log('Create', data)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>XP Reward</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements?.map((ach: any) => (
                <TableRow key={ach.id}>
                  <TableCell>{ach.name}</TableCell>
                  <TableCell>{ach.category}</TableCell>
                  <TableCell>{ach.tier}</TableCell>
                  <TableCell>{ach.xp_reward}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <AchievementForm initialData={ach} onSubmit={(data) => console.log('Update', data)} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface AchievementFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

function AchievementForm({ initialData, onSubmit }: AchievementFormProps) {
  const [form, setForm] = useState(
    initialData || {
      name: '',
      description: '',
      icon: 'Award',
      tier: 'common',
      category: 'ctf_master',
      requirements: { type: 'solve_challenges', target: 10 },
      xpReward: 50,
    }
  );

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <Label>Icon (Lucide icon name)</Label>
        <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
      </div>
      <div>
        <Label>Tier</Label>
        <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Category</Label>
        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      </div>
      <div>
        <Label>Requirement Type</Label>
        <Input
          value={form.requirements.type}
          onChange={(e) => setForm({ ...form, requirements: { ...form.requirements, type: e.target.value } })}
        />
      </div>
      <div>
        <Label>Target</Label>
        <Input
          type="number"
          value={form.requirements.target}
          onChange={(e) =>
            setForm({ ...form, requirements: { ...form.requirements, target: parseInt(e.target.value) } })
          }
        />
      </div>
      <div>
        <Label>XP Reward</Label>
        <Input
          type="number"
          value={form.xpReward}
          onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) })}
        />
      </div>
      <Button onClick={() => onSubmit(form)}>Save</Button>
    </div>
  );
}